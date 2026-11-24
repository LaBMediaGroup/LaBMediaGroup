# Shed event board and Drone School

## Event board

A portrait Quartet 35-380352Q sits against the inner rear wall, between the refrigerator and the workbench. Its outer dimensions are 0.5842 × 0.889 m. The product photo shows narrow oak-finish rails around a recessed natural cork face. Two horizontal 19 mm blocking strips span the shed studs and carry the framed backing. The frame cross section, fastener dimensions and blocking are installation estimates. [Quartet product and photos](https://www.quartet.com/p/bulletin-boards/cork-boards/quartet-cork-bulletin-board-23-x-35-oak-finish-frame/)

The calendar takes its 0.381 × 0.3048 m sheet and paired wire binding with a central hanger from Blue Sky’s Brook Gossen 155270-A27AMZ. The calendar artwork, cork texture, title strip and pinned handbill were drawn for this site. The monthly dates and selected notice share one print texture and the same native hit targets in the no-WebGL layout. The two paper faces use separate geometry with atlas UVs. The existing shed lamp and daylight shade the print. [Calendar dimensions and manufacturer's photos](https://www.bluesky.com/products/daisy-check-2025-2026-wall-calendar-15x12-brook-gossen)

Records come from the site's shared Michigan events list. The board opens to the next listed event, or the latest archived listing when all dates have passed. A marked date selects a notice, its title opens the local detail, and month arrows can also reach months without listings. The notebook retains its own page and resource selection.

## Aircraft

DJI’s Mini 4 Pro has a published flying envelope of 0.298 × 0.373 × 0.101 m, including its propellers. Its body carries four open arms, forward landing legs, navigation sensors and a suspended front camera. The model has a 0.373 m swept propeller width. The light-grey shell, sensor glazing and leg shape follow the aircraft diagram. [DJI dimensions](https://www.dji.com/mini-4-pro/specs) · [Aircraft diagram, page 14](https://dl.djicdn.com/downloads/DJI_Mini_4_Pro/20240627/DJI_Mini_4_Pro_User_Manual_EN.pdf#page=14)

DJI’s Avata 2 measures 0.185 × 0.212 × 0.064 m. Four integral guards enclose the propellers. The elongated housing carries the battery and front camera. Dark polymer guards, open braces and the camera cradle follow the diagram. Both aircraft are simplified for the field camera. Shell sections, bracket dimensions and the terrain-relative flight paths are authored approximations. [DJI dimensions](https://www.dji.com/avata-2/specs) · [Aircraft diagram, page 23](https://dl.djicdn.com/downloads/DJI_Avata_2/UM/20240424/DJI_Avata_2_User_Manual_v1.0_en.pdf#page=23)

The two circuits use the bank-side camera mark in world space. The Mini flies a slower pass, and the guarded FPV aircraft banks through a wider circuit. Each motor has a separate propeller pivot. Reduced motion holds a static flight pose. The school links are drawn from the existing SkyBound guide.

## Verification

The mobile browser rendered the close-up, changed months and selected a marked date. Four rear-facing raycasts through the fastener positions found the blocking against the studs at local z −1.1495 m and the board backing at −1.1305 m. The 36-sample portrait camera pass kept at least 0.363 m from the merged timber and hardware geometry. Each of eight rotor pivots was sampled at 10° increments against its aircraft’s fixed mesh using Blender BVH, with the mating hub excluded. All blade checks passed. The simplified Avata measures 0.185 × 0.212 × 0.064 m. The Mini’s unfurled blade orientation changes its measured width as the propellers turn.
