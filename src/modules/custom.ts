import {
	Color,
	DOTAGameState,
	Hero,
	LocalPlayer,
	Menu,
	PARTICLE_RENDER_NAME,
	ParticleAttachment,
	ParticlesSDK
} from "github.com/octarine-public/wrapper/index"

import { MenuManager } from "../menu/index"
import { BaseManager } from "./base"

interface CustomRadiusNode {
	readonly range: Menu.Slider
	readonly node: Menu.IMenuParticlePicker
}

export class CustomRadiusManager extends BaseManager {
	private readonly radiusesNodes: CustomRadiusNode[] = []
	private readonly pNames: PARTICLE_RENDER_NAME[] = [
		PARTICLE_RENDER_NAME.NORMAL,
		PARTICLE_RENDER_NAME.ROPE
	]

	constructor(
		protected readonly menu: MenuManager,
		protected readonly pSDK: ParticlesSDK
	) {
		super(menu, pSDK)
		this.RadiusesCount.OnValue(call => this.AddOrRemoveNode(call.value))
		Menu.Localization.AddLocalizationUnit("russian", this.GetLocalization)
	}

	protected get RadiusMenu() {
		return this.menu.CustomRadiusMenu
	}

	protected get RadiusesCount() {
		return this.RadiusMenu.RadiusesCount
	}

	protected get State() {
		return this.menu.State.value && this.RadiusMenu.State.value
	}

	protected get GetLocalization(): Map<string, string> {
		const map = new Map<string, string>()
		for (let i = 0; i < this.RadiusesCount.max; i++) {
			map.set(`Radius #${i + 1}`, `Радиус #${i + 1}`)
		}
		return map
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

	public GameStarted() {
		this.UpdateRadiusByArr()
	}

	public GameEnded() {
		this.UpdateRadiusByArr(true)
	}

	protected AddOrRemoveNode(currValue: number) {
		const totalCount = this.radiusesNodes.length
		if (totalCount < currValue) {
			this.AddNode(currValue, totalCount)
			this.RadiusMenu.Tree.Update()
			return
		}
		const nodes = this.radiusesNodes.splice(currValue, totalCount - currValue)
		for (let index = 0, end = nodes.length; index < end; index++) {
			const nodeObj = nodes[index]
			nodeObj.node.Node.DetachFromParent()
			this.UpdateRadius(nodeObj, true)
			this.RadiusMenu.Tree.Update()
		}
	}

	protected AddNode(currValue: number, totalCount: number) {
		for (let index = 0; index < currValue - totalCount; index++) {
			const visibleID = totalCount + index + 1
			const node = this.RadiusMenu.Tree.AddParticlePicker(
				`Radius #${visibleID}`,
				Color.Green.SetA(255 / 2),
				this.pNames,
				[true, true]
			)
			node.Fill.OnValue(() => this.UpdateRadiusByArr())
			node.Color.OnValue(() => this.UpdateRadiusByArr())
			node.Style.OnValue(() => this.UpdateRadiusByArr())
			node.State?.OnValue(() => this.UpdateRadiusByArr())
			const range = node.Node.AddSlider("Radius", 1200 * (visibleID / 1.5), 1, 5000)
			range.OnValue(() => this.UpdateRadiusByArr())
			this.radiusesNodes.push({ node, range })
		}
	}

	protected UpdateRadius(obj: CustomRadiusNode, destroy = false) {
		const localHero = LocalPlayer?.Hero
		const keyName = obj.node.Node.InternalName.split(" ").join("_")
		if (destroy || localHero === undefined || !this.State || !obj.node.State?.value) {
			this.pSDK.DestroyByKey(keyName)
			return
		}
		this.pSDK.DrawCircle(keyName, localHero, obj.range.value, {
			Color: obj.node.Color.SelectedColor,
			Fill: obj.node.Fill.value,
			RenderStyle: obj.node.Style.SelectedID,
			Attachment: ParticleAttachment.PATTACH_ABSORIGIN_FOLLOW
		})
	}

	protected UpdateRadiusByArr(destroy = false) {
		for (let index = this.radiusesNodes.length - 1; index > -1; index--) {
			this.UpdateRadius(this.radiusesNodes[index], destroy)
		}
	}
}
