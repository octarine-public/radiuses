import {
	DOTAGameState,
	ParticlesSDK,
	Tower
} from "github.com/octarine-public/wrapper/index"

import { TowerMenu } from "./menu/tower"

export class TowerManager {
	private readonly towers: Tower[] = []

	constructor(
		private readonly menu: TowerMenu,
		private readonly pSDK: ParticlesSDK
	) {}
	public EntityCreated(entity: Tower) {
		this.towers.push(entity)
	}

	public LifeStateChanged(entity: Tower) {
		if (!entity.IsAlive) {
			this.Destroy(entity)
		}
	}

	public EntityDestroyed(entity: Tower) {
		this.Destroy(entity)
	}

	public GameStateChanged(_newState: DOTAGameState) {
		/** @todo */
	}

	protected Create(_tower: Tower) {
		/** @todo */
	}

	protected Destroy(entity: Tower) {
		this.towers.remove(entity)
	}

	protected TowerKeyName(tower: Tower) {
		return `tower_${tower.Index}`
	}
}
