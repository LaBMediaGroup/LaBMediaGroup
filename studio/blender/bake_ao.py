"""Bake ambient occlusion lightmaps for the room's big surfaces.

blender -b lab-studio-loft.blend --python bake_ao.py -- <out_dir>
Run after build_loft.py (a rebuild drops the Lightmap UVs). Each target gets a second UV layer
"Lightmap" (smart project, packed 0-1, 0.01 margin) while its first layer "UVMap" (world-scale,
1 unit = 1 m) keeps driving the materials. The AO lands in <out_dir>/<object>.png; the browser
applies it as an aoMap on UV channel 1.
"""
import bpy, sys, os, math

out = sys.argv[sys.argv.index("--") + 1]
os.makedirs(out, exist_ok=True)
TARGETS = {  # object: map size
    "Floor": 1024, "Ceiling": 512, "Wall_North": 1024, "Wall_South": 1024, "Wall_East": 1024,
    "Wall_West_Below": 512, "Wall_West_Head": 512, "Wall_West_Left": 512, "Wall_West_Right": 512,
    "Rug": 512, "Desk_Top": 512, "WindowSeat": 512, "Shelf_Case": 512,
}
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.device = 'CPU'
scene.cycles.samples = 96
scene.render.bake.margin = 8
if scene.world:
    scene.world.light_settings.distance = 1.1      # AO reach: corners and contact, not whole-room darkening

# keep the outside out of it (trees and the field would only darken the window wall's exterior faces)
outside = bpy.data.collections.get("Loft_Outside")
if outside:
    outside.hide_render = True
air = bpy.data.objects.get("Room_Air")
if air:
    air.hide_render = True

vl = bpy.context.view_layer
done = {}
for name, size in TARGETS.items():
    ob = bpy.data.objects.get(name)
    if not ob or ob.type != 'MESH':
        continue
    me = ob.data
    if "UVMap" not in me.uv_layers:
        # bmesh-made boxes name their world-scale layer "Float2": keep it first, just name it properly
        if len(me.uv_layers): me.uv_layers[0].name = "UVMap"
        else: me.uv_layers.new(name="UVMap")
    lm = me.uv_layers.get("Lightmap") or me.uv_layers.new(name="Lightmap")
    # lightmap UVs: packed islands, every face its own space
    for o in vl.objects:
        o.select_set(False)
    ob.select_set(True); vl.objects.active = ob
    me.uv_layers.active = lm
    with bpy.context.temp_override(active_object=ob, object=ob, selected_objects=[ob], selected_editable_objects=[ob]):
        bpy.ops.object.mode_set(mode='EDIT')
        bpy.ops.mesh.select_all(action='SELECT')
        bpy.ops.uv.smart_project(angle_limit=math.radians(66), island_margin=0.01, scale_to_bounds=True)
        bpy.ops.object.mode_set(mode='OBJECT')
    assert ob.mode == 'OBJECT'
    img = bpy.data.images.get(f"AO_{name}") or bpy.data.images.new(f"AO_{name}", size, size, alpha=False)
    img.colorspace_settings.name = 'Non-Color'
    # every material on the object gets the target image as its active node
    nodes = []
    for slot in ob.material_slots:
        if not slot.material:
            continue
        nt = slot.material.node_tree
        n = nt.nodes.get("AO_TARGET") or nt.nodes.new("ShaderNodeTexImage")
        n.name = "AO_TARGET"; n.image = img
        nt.nodes.active = n; nodes.append((nt, n))
    bpy.ops.object.bake(type='AO', use_selected_to_active=False, margin=8, uv_layer="Lightmap")
    img.filepath_raw = os.path.join(out, f"{name}.png"); img.file_format = 'PNG'; img.save()
    for nt, n in nodes:
        nt.nodes.remove(n)
    me.uv_layers.active = me.uv_layers["UVMap"]      # materials keep the world-scale UVs
    me.uv_layers["UVMap"].active_render = True
    done[name] = size
    print("BAKED", name, size, flush=True)

if outside:
    outside.hide_render = False
if air:
    air.hide_render = False
scene.render.engine = 'BLENDER_EEVEE'
bpy.ops.wm.save_mainfile()
print("AO_DONE", len(done), flush=True)
