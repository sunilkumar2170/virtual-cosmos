export const AVATARS = [
  { id: 'blue',   color: 0x4F8EF7, label: 'Blue'   },
  { id: 'pink',   color: 0xF76B8A, label: 'Pink'   },
  { id: 'green',  color: 0x4ECDC4, label: 'Green'  },
  { id: 'orange', color: 0xF7B731, label: 'Orange' },
  { id: 'purple', color: 0xA55EEA, label: 'Purple' },
  { id: 'red',    color: 0xFC5C65, label: 'Red'    },
]

export function getAvatarColor(avatarId) {
  return AVATARS.find(a => a.id === avatarId)?.color || 0x4F8EF7
}

export const WORLD_WIDTH  = 2000
export const WORLD_HEIGHT = 1500
export const PROXIMITY_RADIUS = 150
export const MOVE_SPEED = 4
