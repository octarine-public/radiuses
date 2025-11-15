import {
	Color,
	DOTAGameState,
	GameRules,
	GameState,
	ParticleAttachment,
	ParticlesSDK,
	Team,
	Tower,
	Unit
} from "github.com/octarine-public/wrapper/index"

import { ETeam } from "../enum"
import { MenuManager } from "../menu/index"

export class TowerManager {
	private readonly towers: Tower[] = []
	private lastIsNightGameTime = false

	constructor(
		private readonly menu: MenuManager,
		private readonly pSDK: ParticlesSDK
	) {}

	protected get TowerMenu() {
		return this.menu.TowerMenu
	}

	protected get State() {
		return this.menu.State.value && this.TowerMenu.State.value
	}

	public Draw() {
		if (this.State && this.TowerMenu.Target.value) {
			this.UpdateTowersTargets()
		}
	}
	public PostDataUpdate() {
		if (GameRules === undefined) {
			return
		}
		if (this.lastIsNightGameTime !== GameRules.IsNightGameTime) {
			this.lastIsNightGameTime = GameRules.IsNightGameTime
			this.UpdateRadiusByArr()
		}
	}
	public MenuChanged() {
		this.UpdateRadiusByArr()
		const menu = this.TowerMenu
		const state = this.State && menu.Target.value
		this.UpdateTowersTargets(!state)
	}

	public EntityCreated(entity: Tower) {
		this.towers.push(entity)
		this.UpdateRadius(entity)
	}

	public LifeStateChanged(entity: Tower) {
		if (!entity.IsAlive) {
			this.Destroy(entity)
		}
	}

	public EntityDestroyed(entity: Tower) {
		this.Destroy(entity)
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

	protected UpdateRadius(tower: Tower, destroy = false) {
		const menu = this.menu.TowerMenu
		if (!this.State || destroy || !this.StateByMenu(tower, menu.Team.SelectedID)) {
			this.pSDK.DestroyByKey(this.TowerKeyName(tower))
			return
		}
		const baseHull = 25
		const keyName = this.TowerKeyName(tower)
		const color = tower.IsEnemy()
			? menu.EnemyColor.SelectedColor
			: menu.AllyColor.SelectedColor
		let range = tower.GetAttackRange(undefined, baseHull)
		if (this.lastIsNightGameTime) {
			range -= range - tower.NightVisionRange + baseHull
		}
		console.log(range, this.lastIsNightGameTime)
		this.pSDK.DrawCircle(keyName, tower, range, {
			Color: color,
			Fill: menu.Fill.value,
			RenderStyle: menu.Style.SelectedID,
			Attachment: ParticleAttachment.PATTACH_POINT_FOLLOW
		})
	}
	protected Destroy(entity: Tower) {
		this.towers.remove(entity)
		this.pSDK.DestroyByKey(this.TowerKeyName(entity))
		this.pSDK.DestroyByKey(this.TowerTargetKeyName(entity))
	}
	protected StateByMenu(tower: Tower, eTeam: ETeam) {
		return (
			!(
				tower.IsEnemy() &&
				eTeam === ETeam.Enemies &&
				GameState.LocalTeam !== Team.Observer
			) && !(!tower.IsEnemy() && eTeam === ETeam.Allies)
		)
	}
	protected UpdateRadiusByArr(destroy = false) {
		for (let i = this.towers.length - 1; i > -1; i--) {
			this.UpdateRadius(this.towers[i], destroy)
		}
	}
	protected UpdateTowersTargets(destroy = false) {
		for (let index = this.towers.length - 1; index > -1; index--) {
			const tower = this.towers[index],
				target = tower.TowerAttackTarget,
				keyName = this.TowerTargetKeyName(tower)
			if (
				destroy ||
				target === undefined ||
				!this.isShouldBeValidTarget(tower, target)
			) {
				this.pSDK.DestroyByKey(keyName)
				continue
			}
			this.pSDK.DrawLineToTarget(keyName, tower, target, Color.Red)
		}
	}
	protected TowerKeyName(tower: Tower) {
		return `tower_${tower.Index}`
	}
	protected TowerTargetKeyName(tower: Tower) {
		return `tower_target_${tower.Index}`
	}
	private isShouldBeValidTarget(tower: Tower, target: Unit) {
		const menu = this.TowerMenu
		if (!menu.Target.value) {
			return false
		}
		if (!target.IsAlive || !target.IsVisible) {
			return false
		}
		return tower.IsInRange(target.Position, tower.GetAttackRange(target))
	}
}
