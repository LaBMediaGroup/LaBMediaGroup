"""LaB studio loft: blockout, materials, light and a test camera move.

Run inside Blender 5.2 (live link or `blender -b file.blend --python build_loft.py`).
Rebuilds everything in the "Loft" collections from scratch, so it is safe to re-run.
Units are metres. Z up. West = -X (the window wall), north = +Y (the events wall).
"""
import bpy, bmesh, math
from mathutils import Vector

ROOM = dict(x0=-3.0, x1=3.0, y0=-2.6, y1=2.6, h=3.3, t=0.3)
WIN = dict(y0=-1.5, y1=1.5, z0=0.45, z1=3.0)          # west window opening
SUN_SHADOW_SOFTNESS = math.radians(0.6)              # real sun is ~0.53 deg
# The building is turned so the big window faces south-west (compass 232 deg).
# Room-local axes: the window wall is -X. A real compass azimuth A maps to local A + (270 - WINDOW_FACES).
WINDOW_FACES = 232.0

scene = bpy.context.scene

# ---------------------------------------------------------------- helpers
def collection(name, parent=None):
    col = bpy.data.collections.get(name)
    if col:
        for ob in list(col.objects):
            bpy.data.objects.remove(ob, do_unlink=True)
    else:
        col = bpy.data.collections.new(name)
        (parent or scene.collection).children.link(col)
    return col

def mesh_object(name, verts, faces, col, mat=None):
    me = bpy.data.meshes.get(name) or bpy.data.meshes.new(name)
    me.clear_geometry(); me.materials.clear()
    me.from_pydata(verts, [], faces)
    me.update()
    ob = bpy.data.objects.new(name, me)
    col.objects.link(ob)
    if mat:
        me.materials.append(mat)
    return ob

def box(name, lo, hi, col, mat=None, bevel=0.0):
    (x0, y0, z0), (x1, y1, z1) = lo, hi
    v = [(x0,y0,z0),(x1,y0,z0),(x1,y1,z0),(x0,y1,z0),(x0,y0,z1),(x1,y0,z1),(x1,y1,z1),(x0,y1,z1)]
    f = [(0,3,2,1),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7)]
    ob = mesh_object(name, v, f, col, mat)
    if bevel:
        m = ob.modifiers.new("Bevel", 'BEVEL'); m.width = bevel; m.segments = 2
        m.limit_method = 'ANGLE'
    uv_cube(ob)
    return ob

def plane(name, center, size, normal_axis, col, mat=None):
    """Axis-aligned rectangle. normal_axis: '+Y', '-Y', '+X', '-X', '+Z'."""
    cx, cy, cz = center; w, h = size
    if normal_axis in ('+Y', '-Y'):
        v = [(cx-w/2,cy,cz-h/2),(cx+w/2,cy,cz-h/2),(cx+w/2,cy,cz+h/2),(cx-w/2,cy,cz+h/2)]
        f = [(0,1,2,3)] if normal_axis == '-Y' else [(3,2,1,0)]
    elif normal_axis in ('+X', '-X'):
        v = [(cx,cy+w/2,cz-h/2),(cx,cy-w/2,cz-h/2),(cx,cy-w/2,cz+h/2),(cx,cy+w/2,cz+h/2)]
        f = [(0,1,2,3)] if normal_axis == '-X' else [(3,2,1,0)]   # (0,1,2,3) winds to a -X normal
    else:
        v = [(cx-w/2,cy-h/2,cz),(cx+w/2,cy-h/2,cz),(cx+w/2,cy+h/2,cz),(cx-w/2,cy+h/2,cz)]
        f = [(0,1,2,3)]
    ob = mesh_object(name, v, f, col, mat)
    me = ob.data
    uv = me.uv_layers.new(name="UVMap")
    # reversed faces start at the top-left as seen from the front, so their UVs start there too (keeps decals upright)
    uvs = {'+X': [(1,1),(0,1),(0,0),(1,0)], '+Y': [(1,1),(0,1),(0,0),(1,0)]}.get(normal_axis, [(0,0),(1,0),(1,1),(0,1)])
    for loop, co in zip(me.polygons[0].loop_indices, uvs):
        uv.data[loop].uv = co
    return ob

def uv_cube(ob):
    bm = bmesh.new(); bm.from_mesh(ob.data)
    uv = bm.loops.layers.uv.verify()
    for face in bm.faces:
        n = face.normal
        ax = max(range(3), key=lambda i: abs(n[i]))
        for loop in face.loops:
            co = loop.vert.co
            loop[uv].uv = (co.y, co.z) if ax == 0 else (co.x, co.z) if ax == 1 else (co.x, co.y)
    bm.to_mesh(ob.data); bm.free()

def cylinder(name, base, radius, height, col, mat=None, segments=24, axis='Z', top=None):
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=segments, radius1=radius, radius2=radius if top is None else top, depth=height)
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    ob = bpy.data.objects.new(name, me); col.objects.link(ob)
    if axis == 'X': ob.rotation_euler = (0, math.radians(90), 0)
    if axis == 'Y': ob.rotation_euler = (math.radians(90), 0, 0)
    ob.location = base
    if mat: me.materials.append(mat)
    for p in me.polygons: p.use_smooth = True
    return ob

# ---------------------------------------------------------------- materials
def node_mat(name):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree; nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial"); out.location = (600, 0)
    bsdf = nt.nodes.new("ShaderNodeBsdfPrincipled"); bsdf.location = (300, 0)
    nt.links.new(bsdf.outputs[0], out.inputs[0])
    return m, nt, bsdf

def simple(name, color, rough=0.6, metal=0.0):
    m, nt, b = node_mat(name)
    b.inputs["Base Color"].default_value = (*color, 1)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    return m

def plaster():
    m, nt, b = node_mat("M_Limewash")
    tc = nt.nodes.new("ShaderNodeTexCoord")
    noise = nt.nodes.new("ShaderNodeTexNoise"); noise.inputs["Scale"].default_value = 3.0
    noise.inputs["Detail"].default_value = 8; noise.inputs["Roughness"].default_value = .6
    fine = nt.nodes.new("ShaderNodeTexNoise"); fine.inputs["Scale"].default_value = 60
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = (0.72, 0.65, 0.55, 1)
    ramp.color_ramp.elements[1].color = (0.83, 0.77, 0.67, 1)
    bump = nt.nodes.new("ShaderNodeBump"); bump.inputs["Strength"].default_value = 0.12
    for a, bb in [(tc.outputs["Object"], noise.inputs[0]), (tc.outputs["Object"], fine.inputs[0]),
                  (noise.outputs["Fac"], ramp.inputs[0]), (ramp.outputs[0], b.inputs["Base Color"]),
                  (fine.outputs["Fac"], bump.inputs["Height"]), (bump.outputs[0], b.inputs["Normal"])]:
        nt.links.new(a, bb)
    b.inputs["Roughness"].default_value = 0.92
    return m

def limewashed_brick():
    m, nt, b = node_mat("M_LimewashBrick")
    tc = nt.nodes.new("ShaderNodeTexCoord")
    sep = nt.nodes.new("ShaderNodeSeparateXYZ"); comb = nt.nodes.new("ShaderNodeCombineXYZ")
    brick = nt.nodes.new("ShaderNodeTexBrick")
    brick.inputs["Scale"].default_value = 2.5
    brick.inputs["Brick Width"].default_value = 0.5
    brick.inputs["Row Height"].default_value = 0.17
    brick.inputs["Mortar Size"].default_value = 0.012
    brick.inputs["Color1"].default_value = (0.74, 0.62, 0.53, 1)
    brick.inputs["Color2"].default_value = (0.62, 0.47, 0.39, 1)
    brick.inputs["Mortar"].default_value = (0.86, 0.84, 0.78, 1)
    wash = nt.nodes.new("ShaderNodeTexNoise"); wash.inputs["Scale"].default_value = 2.2; wash.inputs["Detail"].default_value = 6
    wr = nt.nodes.new("ShaderNodeMapRange"); wr.inputs["From Min"].default_value = .35; wr.inputs["From Max"].default_value = .7
    mix = nt.nodes.new("ShaderNodeMix"); mix.data_type = 'RGBA'
    mix.inputs["B"].default_value = (0.84, 0.81, 0.75, 1)
    bump = nt.nodes.new("ShaderNodeBump"); bump.inputs["Strength"].default_value = .35
    L = nt.links.new
    # west wall lies in the YZ plane: feed (y, z) to the brick pattern
    L(tc.outputs["Object"], sep.inputs[0]); L(sep.outputs["Y"], comb.inputs["X"]); L(sep.outputs["Z"], comb.inputs["Y"])
    L(comb.outputs[0], brick.inputs[0]); L(tc.outputs["Object"], wash.inputs[0])
    L(wash.outputs["Fac"], wr.inputs[0]); L(wr.outputs[0], mix.inputs["Factor"])
    L(brick.outputs["Color"], mix.inputs["A"]); L(mix.outputs["Result"], b.inputs["Base Color"])
    L(brick.outputs["Fac"], bump.inputs["Height"]); L(bump.outputs[0], b.inputs["Normal"])
    b.inputs["Roughness"].default_value = .9
    return m

def oak(name="M_OakFloor", plank=True, tint=(0.52, 0.36, 0.22)):
    m, nt, b = node_mat(name)
    tc = nt.nodes.new("ShaderNodeTexCoord")
    mp = nt.nodes.new("ShaderNodeMapping"); mp.inputs["Scale"].default_value = (1, 7, 1)
    wave = nt.nodes.new("ShaderNodeTexWave"); wave.wave_type = 'BANDS'; wave.bands_direction = 'X'
    wave.inputs["Scale"].default_value = 1.6; wave.inputs["Distortion"].default_value = 2.2
    wave.inputs["Detail"].default_value = 6; wave.inputs["Detail Roughness"].default_value = .65
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = (*[c*0.62 for c in tint], 1)
    ramp.color_ramp.elements[1].color = (*tint, 1)
    L = nt.links.new
    L(tc.outputs["Object"], mp.inputs[0]); L(mp.outputs[0], wave.inputs[0]); L(wave.outputs["Fac"], ramp.inputs[0])
    col_out = ramp.outputs[0]
    if plank:
        brick = nt.nodes.new("ShaderNodeTexBrick")
        bm2 = nt.nodes.new("ShaderNodeMapping"); bm2.inputs["Scale"].default_value = (0.55, 4.6, 1)
        bm2.inputs["Rotation"].default_value = (0, 0, math.radians(90))
        brick.inputs["Scale"].default_value = 1; brick.inputs["Mortar Size"].default_value = .004
        brick.inputs["Color1"].default_value = (1, 1, 1, 1); brick.inputs["Color2"].default_value = (.8, .78, .74, 1)
        brick.inputs["Mortar"].default_value = (.25, .22, .2, 1)
        brick.offset = .37
        mul = nt.nodes.new("ShaderNodeMix"); mul.data_type = 'RGBA'; mul.blend_type = 'MULTIPLY'
        mul.inputs["Factor"].default_value = 1
        bump = nt.nodes.new("ShaderNodeBump"); bump.inputs["Strength"].default_value = .25
        L(tc.outputs["Object"], bm2.inputs[0]); L(bm2.outputs[0], brick.inputs[0])
        L(ramp.outputs[0], mul.inputs["A"]); L(brick.outputs["Color"], mul.inputs["B"])
        L(brick.outputs["Fac"], bump.inputs["Height"]); L(bump.outputs[0], b.inputs["Normal"])
        col_out = mul.outputs["Result"]
    L(col_out, b.inputs["Base Color"])
    # worn satin finish: rougher between planks of traffic
    rn = nt.nodes.new("ShaderNodeTexNoise"); rn.inputs["Scale"].default_value = 1.5
    rr = nt.nodes.new("ShaderNodeMapRange"); rr.inputs["To Min"].default_value = .32; rr.inputs["To Max"].default_value = .6
    L(tc.outputs["Object"], rn.inputs[0]); L(rn.outputs["Fac"], rr.inputs[0]); L(rr.outputs[0], b.inputs["Roughness"])
    return m

def cork():
    m, nt, b = node_mat("M_Cork")
    tc = nt.nodes.new("ShaderNodeTexCoord")
    vor = nt.nodes.new("ShaderNodeTexVoronoi"); vor.inputs["Scale"].default_value = 160
    noise = nt.nodes.new("ShaderNodeTexNoise"); noise.inputs["Scale"].default_value = 90
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = (0.30, 0.18, 0.09, 1)
    ramp.color_ramp.elements[1].color = (0.62, 0.43, 0.25, 1)
    bump = nt.nodes.new("ShaderNodeBump"); bump.inputs["Strength"].default_value = .5
    L = nt.links.new
    L(tc.outputs["Object"], vor.inputs[0]); L(tc.outputs["Object"], noise.inputs[0])
    L(noise.outputs["Fac"], ramp.inputs[0]); L(ramp.outputs[0], b.inputs["Base Color"])
    L(vor.outputs["Distance"], bump.inputs["Height"]); L(bump.outputs[0], b.inputs["Normal"])
    b.inputs["Roughness"].default_value = .95
    return m

def glass():
    # Thin pane as blended alpha, not transmission: EEVEE transmission without ray-traced
    # refraction shows the sky probe instead of the field and trees behind the glass.
    m, nt, b = node_mat("M_WindowGlass")
    b.inputs["Base Color"].default_value = (.92, .96, .95, 1)
    b.inputs["Roughness"].default_value = .03
    b.inputs["Alpha"].default_value = .07
    try: m.surface_render_method = 'BLENDED'
    except Exception: m.blend_method = 'BLEND'
    return m

def emissive(name, color, strength_prop=None, base=10.0):
    m, nt, b = node_mat(name)
    b.inputs["Base Color"].default_value = (*color, 1)
    b.inputs["Emission Color"].default_value = (*color, 1)
    b.inputs["Emission Strength"].default_value = base
    if strength_prop:
        fc = b.inputs["Emission Strength"].driver_add("default_value")
        d = fc.driver; d.type = 'SCRIPTED'
        v = d.variables.new(); v.name = "p"; v.type = 'SINGLE_PROP'
        v.targets[0].id_type = 'SCENE'; v.targets[0].id = scene; v.targets[0].data_path = f'["{strength_prop}"]'
        d.expression = f"p*{base}"
    return m

def image_mat(name, path, rough=.8):
    m, nt, b = node_mat(name)
    tex = nt.nodes.new("ShaderNodeTexImage")
    try:
        tex.image = bpy.data.images.load(path, check_existing=True)
    except Exception:
        pass
    nt.links.new(tex.outputs["Color"], b.inputs["Base Color"])
    b.inputs["Roughness"].default_value = rough
    return m

# ---------------------------------------------------------------- build
def build(site_root):
    scene["practicals"] = 0.0   # 0 = off (day) .. 1 = full (after sunset); browser mirrors this
    root = bpy.data.collections.get("Loft") or bpy.data.collections.new("Loft")
    if root.name not in scene.collection.children: scene.collection.children.link(root)
    shell = collection("Loft_Shell", root); win = collection("Loft_Window", root)
    north = collection("Loft_EventsWall", root); props = collection("Loft_Props", root)
    lights = collection("Loft_Lights", root); outside = collection("Loft_Outside", root)

    M = dict(
        wall=plaster(), brick=limewashed_brick(), floor=oak(),
        beam=oak("M_FirBeam", plank=False, tint=(0.45, 0.30, 0.18)),
        steel=simple("M_BlackSteel", (0.03, 0.03, 0.03), .42, .7),
        cork=cork(), paper=simple("M_Paper", (0.88, 0.86, 0.80), .75),
        glass=glass(), walnut=oak("M_Walnut", plank=False, tint=(0.24, 0.15, 0.09)),
        rug=simple("M_RugWool", (0.42, 0.16, 0.10), .95), cushion=simple("M_Canvas", (0.55, 0.52, 0.44), .9),
        plastic=simple("M_GearBlack", (0.025, 0.025, 0.028), .5), metal=simple("M_Aluminium", (0.6, 0.6, 0.62), .35, 1),
        ground=simple("M_FieldGrass", (0.42, 0.36, 0.17), .95), tree=simple("M_TreeLine", (0.06, 0.08, 0.05), .9),
        bulb=emissive("M_Bulb", (1.0, 0.72, 0.42), "practicals", 30.0),
    )
    R, W = ROOM, WIN
    x0, x1, y0, y1, h, t = R["x0"], R["x1"], R["y0"], R["y1"], R["h"], R["t"]

    # Shell
    box("Floor", (x0-t, y0-t, -0.1), (x1+t, y1+t, 0), shell, M["floor"])
    box("Ceiling", (x0-t, y0-t, h), (x1+t, y1+t, h+0.1), shell, M["wall"])
    box("Wall_North", (x0, y1, 0), (x1, y1+t, h), shell, M["wall"])
    box("Wall_South", (x0, y0-t, 0), (x1, y0, h), shell, M["wall"])
    box("Wall_East", (x1, y0-t, 0), (x1+t, y1+t, h), shell, M["wall"])
    box("Wall_West_Below", (x0-t, y0-t, 0), (x0, y1+t, W["z0"]), shell, M["brick"])
    box("Wall_West_Head", (x0-t, y0-t, W["z1"]), (x0, y1+t, h), shell, M["brick"])
    box("Wall_West_Left", (x0-t, y0-t, W["z0"]), (x0, W["y0"], W["z1"]), shell, M["brick"])
    box("Wall_West_Right", (x0-t, W["y1"], W["z0"]), (x0, y1+t, W["z1"]), shell, M["brick"])
    box("Baseboard_North", (x0, y1-0.02, 0), (x1, y1, 0.12), shell, M["wall"])
    for i, bx in enumerate([-2.1, -0.7, 0.7, 2.1]):
        box(f"Beam_{i}", (bx-0.09, y0, h-0.28), (bx+0.09, y1, h), shell, M["beam"])

    # Window: steel mullions set back in the reveal, glass that lets the sun through
    fx = x0 - 0.2
    for i, yy in enumerate([W["y0"], -0.75, 0, 0.75, W["y1"]]):
        wd = .06 if i in (0, 4) else .035
        box(f"Mullion_V{i}", (fx-0.03, yy-wd/2, W["z0"]), (fx+0.03, yy+wd/2, W["z1"]), win, M["steel"])
    for i, zz in enumerate([W["z0"], 1.15, 1.85, 2.45, W["z1"]]):
        wd = .06 if i in (0, 4) else .03
        box(f"Mullion_H{i}", (fx-0.03, W["y0"], zz-wd/2), (fx+0.03, W["y1"], zz+wd/2), win, M["steel"])
    g = plane("Glass", (fx, 0, (W["z0"]+W["z1"])/2), (W["y1"]-W["y0"], W["z1"]-W["z0"]), '+X', win, M["glass"])
    g.visible_shadow = False
    # Blackout roller shade (pulled for screenings): roller over the opening, fabric hangs from it.
    # Fabric is 40 mm narrower than the opening so a sliver of daylight leaks at the edges.
    linen = simple("M_ShadeLinen", (0.23, 0.21, 0.19), .95)
    cylinder("Shade_Roller", (x0 + 0.045, 0, W["z1"] + 0.07), .035, W["y1"] - W["y0"] + 0.14, win, M["metal"], segments=20, axis='Y')
    for i, yy in enumerate([W["y0"] - 0.08, W["y1"] + 0.08]):
        box(f"Shade_Bracket_{i}", (x0 + 0.005, yy - 0.006, W["z1"] + 0.02), (x0 + 0.09, yy + 0.006, W["z1"] + 0.12), win, M["steel"])
    fab_h = (W["z1"] + 0.05) - (W["z0"] - 0.02)
    fab = plane("Shade_Fabric", (x0 + 0.042, 0, -fab_h / 2), (W["y1"] - W["y0"] - 0.04, fab_h), '+X', win, linen)
    fab.location = (0, 0, W["z1"] + 0.05)          # origin at the roller; the cloth hangs below it
    fab.scale = (1, 1, 0.02)                      # rolled up by default; the browser lowers it
    hem = box("Shade_Hem", (x0 + 0.03, W["y0"] + 0.02, -0.012), (x0 + 0.055, W["y1"] - 0.02, 0.0), win, M["walnut"])
    hem.location = (0, 0, W["z1"] + 0.05 - fab_h * 0.02)
    box("WindowSeat", (x0-0.2, W["y0"], 0), (x0+0.42, W["y1"], W["z0"]), win, M["walnut"], bevel=.01)
    box("SeatCushion", (x0+0.02, W["y0"]+0.1, W["z0"]), (x0+0.4, W["y0"]+1.3, W["z0"]+0.08), win, M["cushion"], bevel=.03)

    # Events wall (north): wall calendar + corkboard over a long desk
    cal = plane("Calendar_Paper", (-1.05, y1-0.012, 1.62), (0.80, 1.02), '-Y', north, M["paper"])
    box("Calendar_Rail", (-1.47, y1-0.03, 2.12), (-0.63, y1-0.005, 2.15), north, M["walnut"])
    box("Cork_Frame", (-0.10, y1-0.035, 1.10), (1.30, y1, 2.10), north, M["walnut"], bevel=.006)
    plane("Cork_Surface", (0.60, y1-0.037, 1.60), (1.34, 0.94), '-Y', north, M["cork"])
    flyer_img = site_root + "/room/light/kickoff-art.webp"
    plane("Flyer_Hero", (0.42, y1-0.041, 1.66), (0.216, 0.279), '-Y', north, image_mat("M_FlyerHero", flyer_img, .7))
    for i, (fxx, fz, w, hh) in enumerate([(0.86, 1.80, .15, .21), (1.06, 1.42, .2, .14), (0.10, 1.38, .13, .18), (0.78, 1.33, .12, .12)]):
        plane(f"Flyer_{i}", (fxx, y1-0.040, fz), (w, hh), '-Y', north, M["paper"])
    box("Desk_Top", (-1.8, y1-0.72, 0.71), (1.6, y1-0.02, 0.75), north, M["walnut"], bevel=.004)
    for i, lx in enumerate([-1.75, 1.55]):
        box(f"Desk_Leg_{i}", (lx-0.03, y1-0.70, 0), (lx+0.03, y1-0.04, 0.71), north, M["steel"])

    # Props: practicals, camera on sticks, projector cart, rug, shelf
    box("Rug", (-2.4, -1.9, 0), (0.6, 1.3, 0.012), props, M["rug"])
    # desk lamp
    cylinder("Lamp_Base", (1.25, y1-0.25, 0.76), .08, .02, props, M["steel"])
    cylinder("Lamp_Stem", (1.25, y1-0.25, 0.98), .008, .44, props, M["metal"])
    shade = cylinder("Lamp_Shade", (1.25, y1-0.36, 1.18), .085, .13, props, M["steel"])
    cylinder("Lamp_Bulb", (1.25, y1-0.36, 1.12), .03, .03, props, M["bulb"])
    # pendant over the room
    cylinder("Pendant_Cord", (0.0, 0.2, h-0.45), .004, .9, props, M["plastic"])
    cylinder("Pendant_Bulb", (0.0, 0.2, h-0.95), .05, .1, props, M["bulb"])
    # cinema camera on a tripod, watching the window
    tx, ty = -2.05, -1.75
    for i in range(3):
        a = math.radians(90 + i*120)
        leg = cylinder(f"Tripod_Leg_{i}", (tx+0.22*math.cos(a), ty+0.22*math.sin(a), 0.6), .012, 1.25, props, M["plastic"])
        leg.rotation_euler = (math.sin(a)*-0.18, math.cos(a)*0.18, 0)
    box("Camera_Head", (tx-0.07, ty-0.07, 1.2), (tx+0.07, ty+0.07, 1.26), props, M["plastic"])
    box("Camera_Body", (tx-0.17, ty-0.07, 1.26), (tx+0.13, ty+0.07, 1.42), props, M["plastic"], bevel=.008)
    cylinder("Camera_Lens", (tx-0.25, ty, 1.34), .055, .16, props, M["plastic"], axis='X')
    # projector on a rolling cart (story generator), aimed at the east wall:
    # ~2.25 m throw gives a 1.5 x 1.0 m picture (lens rise puts it at eye height)
    px, py = 0.5, -1.5
    box("Cart_Top", (px-0.3, py-0.25, 0.68), (px+0.3, py+0.25, 0.71), props, M["steel"])
    box("Cart_Shelf", (px-0.3, py-0.25, 0.2), (px+0.3, py+0.25, 0.22), props, M["steel"])
    for i, (cx, cy) in enumerate([(-1,-1),(1,-1),(1,1),(-1,1)]):
        box(f"Cart_Post_{i}", (px+cx*0.28-0.012, py+cy*0.23-0.012, 0.03), (px+cx*0.28+0.012, py+cy*0.23+0.012, 0.68), props, M["steel"])
    # 16 mm film projector (Selected work): body, two reel arms, reels on y axles, lens toward the wall
    pj = simple("M_ProjectorGrey", (0.16, 0.17, 0.16), .45, .3)
    box("Projector_Body", (px-0.17, py-0.08, 0.71), (px+0.17, py+0.08, 0.92), props, pj, bevel=.012)
    box("Projector_Gate", (px+0.12, py-0.05, 0.74), (px+0.2, py+0.05, 0.86), props, M["plastic"], bevel=.006)
    for name, (ax, az) in (("Front", (px+0.12, 1.20)), ("Rear", (px-0.17, 1.17))):
        box(f"Reel_Arm_{name}", (ax-0.012, py-0.012, 0.9), (ax+0.012, py+0.012, az), props, M["metal"])
        cylinder(f"Reel_{name}", (ax, py+0.035, az), .145, .028, props, M["metal"], segments=48, axis='Y')
    cylinder("Projector_Lens", (px+0.25, py, 0.80), .032, .1, props, M["plastic"], axis='X')

    # Retro fridge, after the Smeg FAB28 (right-hinged 50s style; UK spec sheet FAB28LPB5UK):
    # 1530 H x 601 W x 728 D mm (732 with handle). Pillow door with heavily rounded front edges,
    # short chrome lever handle on the opening side ~0.97 m up, chrome nameplate up top (ours says LaB),
    # stainless kick strip on feet. Sits 15 mm off the east wall in the north-east corner.
    enamel = node_mat("M_FridgeEnamel")[0]
    eb = enamel.node_tree.nodes["Principled BSDF"]
    eb.inputs["Base Color"].default_value = (0.30, 0.42, 0.34, 1); eb.inputs["Roughness"].default_value = .32
    try: eb.inputs["Coat Weight"].default_value = .45
    except Exception: pass
    chrome = simple("M_Chrome", (0.86, 0.87, 0.89), .1, 1)
    gasket = simple("M_Gasket", (0.05, 0.05, 0.05), .7)
    W, D, H = 0.601, 0.728, 1.530
    fy0, fy1 = 0.90, 0.90 + W                    # south edge (hinge) .. north edge (handle)
    back = x1 - 0.015; door_t = 0.075
    fx_door = back - D                            # front face of the door
    fx_cab = fx_door + door_t                     # front face of the cabinet
    def rounded_slab(name, xa, xb, ya, yb, za, zb, r_top, r_bot, edge_r, mat, col):
        """Rounded rectangle in YZ (top/bottom corner radii), extruded along X, front perimeter bevelled."""
        bm = bmesh.new(); pts = []
        def arc(cy, cz, r, a0, a1, n=10):
            for i in range(n + 1):
                a = a0 + (a1 - a0) * i / n; pts.append((cy + r * math.cos(a), cz + r * math.sin(a)))
        arc(yb - r_top, zb - r_top, r_top, 0, math.pi / 2)
        arc(ya + r_top, zb - r_top, r_top, math.pi / 2, math.pi)
        arc(ya + r_bot, za + r_bot, r_bot, math.pi, 1.5 * math.pi, 4)
        arc(yb - r_bot, za + r_bot, r_bot, 1.5 * math.pi, 2 * math.pi, 4)
        verts = [bm.verts.new((xa, y, z)) for y, z in pts]
        face = bm.faces.new(verts)
        ext = bmesh.ops.extrude_face_region(bm, geom=[face])
        moved = [v for v in ext["geom"] if isinstance(v, bmesh.types.BMVert)]
        bmesh.ops.translate(bm, verts=moved, vec=(xb - xa, 0, 0))
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
        me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
        # bevel only the front perimeter (the face at xa) for the pillow edge
        bw = me.attributes.get("bevel_weight_edge") or me.attributes.new("bevel_weight_edge", 'FLOAT', 'EDGE')
        for e in me.edges:
            a, b = me.vertices[e.vertices[0]].co, me.vertices[e.vertices[1]].co
            bw.data[e.index].value = 1.0 if abs(a.x - xa) < 1e-5 and abs(b.x - xa) < 1e-5 else 0.0
        ob = bpy.data.objects.new(name, me); col.objects.link(ob); me.materials.append(mat)
        m = ob.modifiers.new("Bevel", 'BEVEL'); m.width = edge_r; m.segments = 6; m.limit_method = 'WEIGHT'
        ob.modifiers.new("WeightedNormal", 'WEIGHTED_NORMAL').keep_sharp = True
        for poly in me.polygons: poly.use_smooth = True
        return ob
    # cabinet: flat sides, softly rounded top, rests on the plinth
    rounded_slab("Fridge_Cabinet", fx_cab, back, fy0, fy1, 0.065, H, 0.06, 0.012, 0.012, enamel, props)
    box("Fridge_Gasket", (fx_cab - 0.004, fy0 + 0.012, 0.085), (fx_cab, fy1 - 0.012, H - 0.03), props, gasket)
    # the pillow door: big top radii, 32 mm rolled front edge
    rounded_slab("Fridge_Door", fx_door, fx_cab - 0.004, fy0 + 0.002, fy1 - 0.002, 0.075, H - 0.004, 0.075, 0.02, 0.032, enamel, props)
    # stainless kick strip on four feet
    box("Fridge_Kick", (fx_cab + 0.01, fy0 + 0.02, 0.022), (back - 0.03, fy1 - 0.02, 0.07), props, simple("M_Stainless", (0.62, 0.63, 0.64), .3, 1), bevel=.004)
    for i, (fx, fy) in enumerate([(fx_cab + 0.05, fy0 + 0.05), (fx_cab + 0.05, fy1 - 0.05), (back - 0.06, fy0 + 0.05), (back - 0.06, fy1 - 0.05)]):
        cylinder(f"Fridge_Foot_{i}", (fx, fy, 0.011), .016, .022, props, M["plastic"], segments=16)
    # lever handle on the opening (north) side: an escutcheon at the edge and a bowed chrome lever toward the hinge
    hz, hy = 0.97, fy1 - 0.055
    box("Fridge_Handle_Base", (fx_door - 0.022, hy - 0.022, hz - 0.018), (fx_door + 0.002, hy + 0.022, hz + 0.018), props, chrome, bevel=.008)
    cu = bpy.data.curves.new("Fridge_Handle_Lever", 'CURVE'); cu.dimensions = '3D'
    cu.bevel_depth = 0.0085; cu.bevel_resolution = 4; cu.resolution_u = 12
    sp = cu.splines.new('BEZIER'); sp.bezier_points.add(2)
    for bp, co in zip(sp.bezier_points, [(fx_door - 0.012, hy, hz), (fx_door - 0.034, hy - 0.08, hz + 0.004), (fx_door - 0.026, hy - 0.165, hz + 0.002)]):
        bp.co = co; bp.handle_left_type = bp.handle_right_type = 'AUTO'
    cob = bpy.data.objects.new("Fridge_Handle_Lever_Curve", cu); props.objects.link(cob)
    dg = bpy.context.evaluated_depsgraph_get(); lever_me = bpy.data.meshes.new_from_object(cob.evaluated_get(dg))
    bpy.data.objects.remove(cob, do_unlink=True)
    lever = bpy.data.objects.new("Fridge_Handle_Lever", lever_me); props.objects.link(lever); lever_me.materials.clear(); lever_me.materials.append(chrome)
    for poly in lever_me.polygons: poly.use_smooth = True
    cylinder("Fridge_Handle_Tip", (fx_door - 0.026, hy - 0.168, hz + 0.002), .0105, .02, props, chrome, segments=20, axis='Y')
    # chrome emblem: the LaB mark (images/TheLaB-mark.png, 1165 x 498) where the FAB28 carries its script badge
    em, ent, emb = node_mat("M_LabEmblem")
    tex = ent.nodes.new("ShaderNodeTexImage")
    try: tex.image = bpy.data.images.load(site_root + "/images/TheLaB-mark.png", check_existing=True)
    except Exception: pass
    emb.inputs["Base Color"].default_value = (0.86, 0.87, 0.89, 1); emb.inputs["Metallic"].default_value = 1; emb.inputs["Roughness"].default_value = .14
    ent.links.new(tex.outputs["Alpha"], emb.inputs["Alpha"])
    try: em.surface_render_method = 'DITHERED'
    except Exception: pass
    bw_, bh_ = 0.12, 0.12 * 498 / 1165
    plane("Fridge_Badge", (fx_door - 0.004, (fy0 + fy1) / 2, H - 0.075), (bw_, bh_), "-X", props, em)

    # on top: a coffee tin and a mug, it is a working studio
    cylinder("Fridge_Tin", (2.70, 1.06, 1.62), .07, .17, props, simple("M_TinRed", (0.55, 0.08, 0.05), .35, .6))
    cylinder("Fridge_Mug", (2.66, 1.33, 1.58), .045, .09, props, M["paper"])

    # bookshelf on the south wall (Notebook)
    box("Shelf_Case", (-1.6, y0, 0), (0.4, y0+0.34, 2.1), props, M["walnut"])
    for i in range(5):
        box(f"Shelf_Board_{i}", (-1.57, y0+0.01, 0.05+i*0.5), (0.37, y0+0.33, 0.08+i*0.5), props, M["beam"])

    # Outside: field and a tree line for the sun to set behind
    box("Ground", (-260, -260, -0.2), (x0-0.3, 260, -0.15), outside, M["ground"])
    import random; random.seed(7)
    # far enough (~160 m) that the canopy tops out near 4 deg: the sun clears it until late golden hour
    for i in range(70):
        ty2 = -210 + i*6.0 + random.uniform(-2, 2)
        hh = random.uniform(11, 18)
        # mixed conifers: tapered, varied girth, clustered at different depths
        tr = cylinder(f"Tree_{i}", (-160 + random.uniform(-25, 25), ty2, hh/2-0.2), random.uniform(2.2, 4.2), hh, outside, M["tree"], segments=9, top=random.uniform(0.05, 0.5))

    # Lights. Every light has a source: the sun through the window, two practicals.
    sun = bpy.data.lights.get("Sun") or bpy.data.lights.new("Sun", 'SUN')
    sun.angle = SUN_SHADOW_SOFTNESS; sun.energy = 6.0; sun.color = (1.0, 0.86, 0.68)
    sob = bpy.data.objects.new("Sun", sun); lights.objects.link(sob)
    for name, loc, energy, size in [("Lamp_Light", (1.25, y1-0.36, 1.1), 18, .03), ("Pendant_Light", (0, 0.2, h-1.0), 45, .05)]:
        L = bpy.data.lights.get(name) or bpy.data.lights.new(name, 'POINT')
        L.color = (1.0, 0.70, 0.42); L.shadow_soft_size = size
        fc = L.driver_add("energy"); d = fc.driver; d.type = 'SCRIPTED'
        v = d.variables.new(); v.name = "p"; v.type = 'SINGLE_PROP'
        v.targets[0].id_type = 'SCENE'; v.targets[0].id = scene; v.targets[0].data_path = '["practicals"]'
        d.expression = f"p*{energy}"
        o = bpy.data.objects.new(name, L); o.location = loc; lights.objects.link(o)

    # Projector lamp: a real source inside the projector, aimed at the picture on the east wall
    scene["projector"] = 1.0
    PJ = bpy.data.lights.get("Projector_Light") or bpy.data.lights.new("Projector_Light", 'SPOT')
    PJ.color = (1.0, 0.94, 0.84); PJ.spot_size = math.radians(40); PJ.spot_blend = 0.12; PJ.shadow_soft_size = 0.02
    fc = PJ.driver_add("energy"); d = fc.driver; d.type = 'SCRIPTED'
    v = d.variables.new(); v.name = "p"; v.type = 'SINGLE_PROP'
    v.targets[0].id_type = 'SCENE'; v.targets[0].id = scene; v.targets[0].data_path = '["projector"]'
    d.expression = "p*60"
    pjo = bpy.data.objects.new("Projector_Light", PJ); lights.objects.link(pjo)
    pjo.location = (px+0.31, py, 0.80)
    aim = Vector((x1, py, 1.55)) - Vector(pjo.location)
    pjo.rotation_mode = 'QUATERNION'; pjo.rotation_quaternion = aim.to_track_quat('-Z', 'Y')

    # Dust in the air so the sun has a visible beam
    vol = box("Room_Air", (x0+0.01, y0+0.01, 0.01), (x1-0.01, y1-0.01, h-0.01), lights)
    vm, vnt, vb = node_mat("M_RoomAir")
    vnt.nodes.remove(vb)
    pv = vnt.nodes.new("ShaderNodeVolumePrincipled"); pv.inputs["Density"].default_value = 0.006
    pv.inputs["Anisotropy"].default_value = 0.55
    vnt.links.new(pv.outputs[0], vnt.nodes["Material Output"].inputs["Volume"])
    vol.data.materials.append(vm)
    vol.visible_shadow = False
    return M

def world_and_render():
    w = bpy.data.worlds.get("LoftSky") or bpy.data.worlds.new("LoftSky")
    scene.world = w; w.use_nodes = True
    nt = w.node_tree; nt.nodes.clear()
    sky = nt.nodes.new("ShaderNodeTexSky"); sky.sky_type = 'MULTIPLE_SCATTERING'
    bg = nt.nodes.new("ShaderNodeBackground"); bg.inputs["Strength"].default_value = 0.22
    out = nt.nodes.new("ShaderNodeOutputWorld")
    nt.links.new(sky.outputs[0], bg.inputs[0]); nt.links.new(bg.outputs[0], out.inputs[0])
    sky.sun_disc = False      # the sun lamp is the visible light; avoid a double sun
    r = scene.render
    r.engine = 'BLENDER_EEVEE'
    ee = scene.eevee
    for k, v in dict(taa_render_samples=48, use_shadows=True, use_raytracing=True, use_volumetric_shadows=True,
                     volumetric_tile_size='4', volumetric_samples=64, fast_gi_method='GLOBAL_ILLUMINATION').items():
        try: setattr(ee, k, v)
        except Exception: pass
    try: ee.ray_tracing_options.resolution_scale = '2'
    except Exception: pass
    scene.view_settings.view_transform = 'AgX'
    for look in ('AgX - Medium High Contrast', 'Medium High Contrast'):
        try: scene.view_settings.look = look; break
        except Exception: pass
    scene.view_settings.exposure = 0.0
    r.fps = 24
    return sky

def set_sun(azimuth_deg, elevation_deg):
    """Azimuth clockwise from north, elevation above horizon (NOAA, same as sun-calc.js)."""
    A, E = math.radians(azimuth_deg + 270.0 - WINDOW_FACES), math.radians(elevation_deg)
    to_sun = Vector((math.sin(A)*math.cos(E), math.cos(A)*math.cos(E), math.sin(E)))
    sob = bpy.data.objects["Sun"]
    sob.rotation_mode = 'QUATERNION'
    sob.rotation_quaternion = (-to_sun).to_track_quat('-Z', 'Y')
    sky = scene.world.node_tree.nodes.get("Sky Texture")
    if sky:
        sky.sun_elevation = E; sky.sun_rotation = math.radians(90) - A  # sky rotation is CCW from +X
    # warmer and dimmer as it drops; practicals come up after sunset
    warm = max(0.0, min(1.0, (elevation_deg - 1) / 25))
    sob.data.color = (1.0, 0.58 + 0.3*warm, 0.32 + 0.5*warm)
    sob.data.energy = 0.0 if elevation_deg < -1 else 5.0 + 12.0*warm
    scene["practicals"] = max(0.0, min(1.0, (4 - elevation_deg) / 8))

# Camera marks shared with the browser (studio/marks.json mirrors these)
MARKS = {
    "window":   dict(loc=(0.9, -0.25, 1.52), yaw=90.0, pitch=2.0, lens=22),
    "calendar": dict(loc=(0.15, 0.05, 1.50), yaw=4.0, pitch=0.5, lens=26),
}

def camera_move():
    cam_data = bpy.data.cameras.get("StudioCam") or bpy.data.cameras.new("StudioCam")
    cam_data.sensor_width = 36; cam_data.clip_end = 1000   # the tree line is ~160 m out
    cam = bpy.data.objects.get("StudioCam") or bpy.data.objects.new("StudioCam", cam_data)
    if cam.name not in scene.collection.objects: scene.collection.objects.link(cam)
    scene.camera = cam
    cam.animation_data_clear(); cam_data.animation_data_clear()
    cam.rotation_mode = 'XYZ'
    # window -> calendar -> window, a fluid-head pan with a small dolly
    keys = [(1, "window"), (37, "window"), (73, "calendar"), (121, "calendar"), (157, "window")]
    for f, mark in keys:
        m = MARKS[mark]
        cam.location = m["loc"]; cam.rotation_euler = (math.radians(90+m["pitch"]), 0, math.radians(m["yaw"]))
        cam_data.lens = m["lens"]
        cam.keyframe_insert("location", frame=f); cam.keyframe_insert("rotation_euler", frame=f)
        cam_data.keyframe_insert("lens", frame=f)
    for fc in list(cam.animation_data.action.fcurves if hasattr(cam.animation_data.action, "fcurves") else []):
        for kp in fc.keyframe_points:
            kp.interpolation = 'BEZIER'; kp.easing = 'AUTO'
    scene.frame_start, scene.frame_end = 1, 157
    return cam
