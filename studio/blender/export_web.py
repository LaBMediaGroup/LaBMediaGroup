"""Export the loft for the browser.
blender -b lab-studio-loft.blend --python export_web.py -- <out.glb>
Exports interior collections only (no outside, no air volume, no lights); the browser relights it.
"""
import bpy, sys, os
out = sys.argv[sys.argv.index("--") + 1]
s = bpy.context.scene
vl = bpy.context.view_layer
for o in s.objects:
    o.select_set(False)
keep = [o for c in ("Loft_Shell", "Loft_Window", "Loft_EventsWall", "Loft_Props") for o in bpy.data.collections[c].objects]
for o in keep:
    o.select_set(True)
vl.objects.active = keep[0]
bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', use_selection=True, export_apply=True,
    export_lights=False, export_cameras=False, export_materials='EXPORT', export_image_format='JPEG',
    export_yup=True, export_draco_mesh_compression_enable=False)
print("EXPORTED", len(keep), os.path.getsize(out))
