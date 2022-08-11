export const DEFAULT_MARGIN = Number.parseFloat(import.meta.env.AMMO_DEFAULT_MARGIN)

export const ENTITY_ANY = -1

// Rigid body is simulated according to applied forces.
export const BODYTYPE_DYNAMIC = 0

// Rigid body has infinite mass and cannot move.
export const BODYTYPE_STATIC = 1

// Rigid body has infinite mass and does not respond to forces but can still be moved by setting their velocity or position.
export const BODYTYPE_KINEMATIC = 2

export const AXIS_X = 0
export const AXIS_Y = 1
export const AXIS_Z = 2

// Collision shapes
export const BODYSHAPE_BOX = 0
export const BODYSHAPE_CAPSULE = 1
export const BODYSHAPE_CONE = 2
export const BODYSHAPE_CYLINDER = 3
export const BODYSHAPE_HEIGHTFIELD = 4
// export const BODYSHAPE_HULL = 5
export const BODYSHAPE_MESH = 6
export const BODYSHAPE_SPHERE = 7

// Collision flags
export const BODYFLAG_NORESPONSE_OBJECT = 4
export const BODYFLAG_KINEMATIC_OBJECT = 2
export const BODYFLAG_STATIC_OBJECT = 1

// Activation states
export const BODYSTATE_ACTIVE_TAG = 1
export const BODYSTATE_ISLAND_SLEEPING = 2
export const BODYSTATE_WANTS_DEACTIVATION = 3
export const BODYSTATE_DISABLE_DEACTIVATION = 4
export const BODYSTATE_DISABLE_SIMULATION = 5

// Groups
export const BODYGROUP_NONE = 0
export const BODYGROUP_DEFAULT = 1
export const BODYGROUP_DYNAMIC = 1
export const BODYGROUP_STATIC = 2
export const BODYGROUP_KINEMATIC = 4
export const BODYGROUP_ENGINE_1 = 8
export const BODYGROUP_TRIGGER = 16
export const BODYGROUP_ENGINE_2 = 32
export const BODYGROUP_ENGINE_3 = 64
export const BODYGROUP_USER_1 = 128
export const BODYGROUP_USER_2 = 256
export const BODYGROUP_USER_3 = 512
export const BODYGROUP_USER_4 = 1024
export const BODYGROUP_USER_5 = 2048
export const BODYGROUP_USER_6 = 4096
export const BODYGROUP_USER_7 = 8192
export const BODYGROUP_USER_8 = 16384

// Masks
export const BODYMASK_NONE = 0
export const BODYMASK_ALL = 65535
export const BODYMASK_STATIC = 2
export const BODYMASK_NOT_STATIC = 65535 ^ 2
export const BODYMASK_NOT_STATIC_KINEMATIC = 65535 ^ (2 | 4)
