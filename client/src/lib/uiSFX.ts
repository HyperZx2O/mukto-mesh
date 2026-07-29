import { createUISFX } from 'uisfx'
import type { CueName } from 'uisfx'
import { useSoundStore } from '@/store/useSoundStore'

let player: ReturnType<typeof createUISFX> | null = null
let unlocked = false

function unlock() {
  if (unlocked || !player) return
  player.unlock()
  unlocked = true
}

function getPlayer() {
  if (typeof window === 'undefined') return null
  if (!player) {
    try {
      player = createUISFX({ pack: 'mechanical', volume: 0.7 })
      if (!unlocked) {
        const gesture = () => {
          unlock()
          document.removeEventListener('click', gesture)
          document.removeEventListener('keydown', gesture)
          document.removeEventListener('touchstart', gesture)
        }
        document.addEventListener('click', gesture)
        document.addEventListener('keydown', gesture)
        document.addEventListener('touchstart', gesture)
      }
    } catch {
      return null
    }
  }
  return player
}

export function playCue(cue: CueName) {
  if (typeof window === 'undefined') return
  if (!useSoundStore.getState().enabled) return
  const p = getPlayer()
  if (p && !unlocked) unlock()
  p?.play(cue)
}

