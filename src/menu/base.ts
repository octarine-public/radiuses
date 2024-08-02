import { Menu } from "github.com/octarine-public/wrapper/index"

import { EMenuType } from "../enum"
import { RadiusesEvents } from "../events"

export abstract class BaseMenu {
	public readonly Tree: Menu.Node
	public readonly State: Menu.Toggle

	constructor(
		node: Menu.Node,
		protected readonly mType: EMenuType,
		defaultValue = false,
		icon?: string,
		round = -1,
		toolTip?: string
	) {
		this.Tree = node.AddNode(mType, icon, toolTip, round)
		this.Tree.SortNodes = false
		this.State = this.Tree.AddToggle("State", defaultValue)
		this.State.OnValue(() => this.EmitMenuChanged())
	}

	protected EmitMenuChanged() {
		RadiusesEvents.emit("MenuChanged", false, this.mType)
	}
}
