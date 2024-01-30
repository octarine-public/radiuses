import {
	DOTAGameState,
	ParticleAttachment,
	Rune
} from "github.com/octarine-public/wrapper/index"

import { BaseManager } from "./base"

export class RuneManager extends BaseManager {
	private readonly pickupRange = 140
	private readonly runes: Rune[] = []

	protected get State() {
		return super.State && this.menu.RuneMenu.State.value
	}

	public EntityCreated(entity: Rune): void {
		this.runes.push(entity)
		this.UpdateRadius(entity)
	}

	public EntityDestroyed(entity: Rune): void {
		this.runes.remove(entity)
		this.pSDK.DestroyByKey(this.RuneKeyName(entity))
	}

	public MenuChanged() {
		this.UpdateRadiusByArr()
	}

	public GameStateChanged(newState: DOTAGameState) {
		switch (newState) {
			case DOTAGameState.DOTA_GAMERULES_STATE_PRE_GAME:
			case DOTAGameState.DOTA_GAMERULES_STATE_GAME_IN_PROGRESS:
				this.UpdateRadiusByArr()
				break
			case DOTAGameState.DOTA_GAMERULES_STATE_POST_GAME:
			case DOTAGameState.DOTA_GAMERULES_STATE_DISCONNECT:
				this.UpdateRadiusByArr(true)
				break
		}
	}

	protected UpdateRadius(spawner: Rune, destroy = false) {
		const keyName = this.RuneKeyName(spawner)
		if (!this.State || destroy) {
			this.pSDK.DestroyByKey(keyName)
			return
		}
		const menu = this.menu.RuneMenu
		this.pSDK.DrawCircle(keyName, spawner, this.pickupRange, {
			Fill: true,
			Color: menu.Color.SelectedColor.SetA(50),
			Attachment: ParticleAttachment.PATTACH_ABSORIGIN_FOLLOW
		})
	}

	protected UpdateRadiusByArr(destroy = false) {
		for (let index = this.runes.length - 1; index > -1; index--) {
			this.UpdateRadius(this.runes[index], destroy)
		}
	}

	protected RuneKeyName(spawner: Rune) {
		return `rune_${spawner.Index}`
	}
}
