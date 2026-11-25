# Shed event board and Drone School

## Event board

A portrait Quartet 35-380352Q sits against the inner rear wall, between the refrigerator and the workbench. Its outer dimensions are 0.5842 × 0.889 m. The product photo shows narrow oak-finish rails around a recessed natural cork face. Two horizontal 19 mm blocking strips span the shed studs and carry the framed backing. The frame cross section, fastener dimensions and blocking are installation estimates. [Quartet product and photos](https://www.quartet.com/p/bulletin-boards/cork-boards/quartet-cork-bulletin-board-23-x-35-oak-finish-frame/)

The calendar takes its 0.381 × 0.3048 m sheet and paired wire binding with a central hanger from Blue Sky’s Brook Gossen 155270-A27AMZ. The calendar artwork, cork texture, title strip and pinned handbill were drawn for this site. The monthly dates and selected notice share one print texture and the same native hit targets in the no-WebGL layout. The two paper faces use separate geometry with atlas UVs. The existing shed lamp and daylight shade the print. [Calendar dimensions and manufacturer's photos](https://www.bluesky.com/products/daisy-check-2025-2026-wall-calendar-15x12-brook-gossen)

Records come from the site's shared Michigan events list. The board opens to the next listed event, or the latest archived listing when all dates have passed. A marked date selects a notice, its title opens the local detail, and month arrows can also reach months without listings. The notebook retains its own page and resource selection.

## Aircraft

DJI’s Mini 4 Pro has a published flying envelope of 0.298 × 0.373 × 0.101 m, including its propellers. Its body carries four open arms, forward landing legs, navigation sensors and a suspended front camera. The model has a 0.373 m swept propeller width. The light-grey shell, sensor glazing and leg shape follow the aircraft diagram. [DJI dimensions](https://www.dji.com/mini-4-pro/specs) · [Aircraft diagram, page 14](https://dl.djicdn.com/downloads/DJI_Mini_4_Pro/20240627/DJI_Mini_4_Pro_User_Manual_EN.pdf#page=14)

DJI’s Avata 2 measures 0.185 × 0.212 × 0.064 m. Four integral guards enclose the propellers. The elongated housing carries the battery and front camera. Dark polymer guards, open braces and the camera cradle follow the diagram. Both aircraft are simplified for the field camera. Shell sections, bracket dimensions and the terrain-relative flight paths are authored approximations. [DJI dimensions](https://www.dji.com/avata-2/specs) · [Aircraft diagram, page 23](https://dl.djicdn.com/downloads/DJI_Avata_2/UM/20240424/DJI_Avata_2_User_Manual_v1.0_en.pdf#page=23)

The original two circuits used the bank-side camera mark. The south-field course below supersedes that staging. The Mini flies a slower pass, and the guarded FPV aircraft banks through a wider circuit. Each motor has a separate propeller pivot. Reduced motion holds a static flight pose. The school links are drawn from the existing SkyBound guide.

## Verification

The mobile browser rendered the close-up, changed months and selected a marked date. Four rear-facing raycasts through the fastener positions found the blocking against the studs at local z −1.1495 m and the board backing at −1.1305 m. The 36-sample portrait camera pass kept at least 0.363 m from the merged timber and hardware geometry. Each of eight rotor pivots was sampled at 10° increments against its aircraft’s fixed mesh using Blender BVH, with the mating hub excluded. All blade checks passed. The simplified Avata measures 0.185 × 0.212 × 0.064 m. The Mini’s unfurled blade orientation changes its measured width as the propellers turn.

## Flight to Ballcap

The camera picks up the Avata during the last part of the Golden Hour stop. Its view follows the actual guarded aircraft while the Mini continues its field circuit. Two curves carry the camera and Avata across the near bank. The Avata rolls into the turn and crosses behind the Ballcap preview at an endpoint fitted to the viewport. The camera levels out at the original website overlook. Reduced motion retains the reading stops with a stationary aircraft pose.

The painted turtle rests and rows on the bottom shelf beside the first cabinet. Its neck starts a turn before the shell follows. Opposite limbs row together, with a quieter glide between strokes. The bluegill use their paired fins asymmetrically to steer. [Painted turtle rowing study](https://pmc.ncbi.nlm.nih.gov/articles/PMC3052254/) · [Bluegill maneuvering study](https://pubmed.ncbi.nlm.nih.gov/11171296/)

Across an 81-second cycle sampled every 0.25 seconds, the turtle's projected bounds cleared the playing glass on all seven cabinets. The check covered four viewport shapes and five camera positions from the gallery to the head-on film view. A separate 450-pose mesh check found no intersections with the cabinets or solid debris. At rest the lowest foot entered the mud by approximately 1.5 mm. In the swimming portion the turtle cleared the bed by at least 0.109 m.

## South field practice course

The three rectangular gates use the MultiGP standard chapter opening, 1.524 m square, with a 2.134 m top pipe and an overall height of 1.829 m. The frame has two vertical PVC supports and a crossbar. Three thin panels represent the matte vinyl mesh. The gate color, checker layout and marker spacing were designed for this field. [MultiGP obstacle guide](https://www.multigp.com/multigp-drone-race-course-obstacles/) · [Dimensioned assembly drawing](https://www.multigp.com/wp-content/uploads/2018/07/multigp-drone-racing-course-obstacle-5x5-gate.jpg)

The four circular gates use Gemfan’s nominal 0.78 m outer diameter. The narrow hoop binding, alternating textile panels, paired lower supports and ground feet follow its portable gate family. The 0.534 m model opening, fabric pattern and support placement are scene choices. The catalog gives an assembled height range of 1.00–1.45 m. The modeled hoop tops are about 1.25 m above the turf. [Gemfan racing gates](https://www.gemfanhobby.com/FPV-Racing-Gate) · [Illustrated catalog](https://img03.71360.com/w3/5p3560/20251117/50ffa18f7578335345b42f12d991fd78.pdf?dl=1&dlf=2025+Gemfan+Product+Catalog.pdf)

Three hoops form the tunnel on the west leg. Each gate faces its flight-line tangent. Each support samples the terrain triangle at its own foot. The Avata finishes its lap to a common exit before banking toward the pond. The Mini circles about 2.85 m above the center of the field. Gate fabric and posts share a single vertex-colored mesh. The field shader provides the cropped-grass boundary and mower passes. These props use solid colors without decal textures or moving joints.

A browser check used a triangle bounding-volume hierarchy over the 5,260 course triangles. Across 3,132 sampled aircraft poses on the circuit and departure, minimum center-to-mesh distances were 0.267 m for the Avata and 0.834 m for the Mini. Minimum center-to-terrain heights were 0.806 m and 2.613 m respectively. Downward rays at seven gate locations agreed with the sampled terrain height within 0.001 m.
