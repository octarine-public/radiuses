import {
	DOTAGameState,
	Hero,
	LocalPlayer,
	ParticleAttachment,
	ParticlesSDK
} from "github.com/octarine-public/wrapper/index"

import { RadiusesMenu } from "../menu/custom"
import { MenuManager } from "../menu/index"
import { BaseManager } from "./base"

export class CustomRadiusManager extends BaseManager {
	constructor(
		protected readonly menu: MenuManager,
		protected readonly pSDK: ParticlesSDK
	) {
		super(menu, pSDK)
		this.menu.CustomRadiusMenu.MenuChanged(this.MenuChanged.bind(this))
	}

	protected get RadiusMenu() {
		return this.menu.CustomRadiusMenu
	}

	protected get State() {
		return this.menu.State.value && this.RadiusMenu.State.value
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
	public MenuChanged() {
		this.UpdateRadiusByArr()
	}
	public EntityCreated(entity: Hero) {
		if (entity.IsMyHero) {
			this.UpdateRadiusByArr()
		}
	}
	public EntityDestroyed(entity: Hero) {
		if (entity.IsMyHero) {
			this.UpdateRadiusByArr(true)
		}
	}
	public LifeStateChanged(entity: Hero) {
		if (entity.IsMyHero) {
			this.UpdateRadiusByArr(!entity.IsAlive)
		}
	}
	protected UpdateRadius(obj: RadiusesMenu, destroy = false) {
		const localHero = LocalPlayer?.Hero
		const keyName = obj.Node.InternalName.split(" ").join("_")
		if (destroy || localHero === undefined || !this.State || !obj.State.value) {
			this.pSDK.DestroyByKey(keyName)
			return
		}
		this.pSDK.DrawCircle(keyName, localHero, obj.Radius.value, {
			Color: obj.Color.SelectedColor,
			Fill: obj.Fill.value,
			RenderStyle: obj.Style.SelectedID,
			Attachment: ParticleAttachment.PATTACH_ABSORIGIN_FOLLOW
		})
	}
	protected UpdateRadiusByArr(destroy = false) {
		for (let i = this.RadiusMenu.Nodes.length - 1; i > -1; i--) {
			this.UpdateRadius(this.RadiusMenu.Nodes[i], destroy)
		}
	}
}
