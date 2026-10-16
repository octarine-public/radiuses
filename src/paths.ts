/** Root the loader mounts this package at: a spelled-out repository path does not resolve. */
const files = `${__OCT_PACKAGE_ROOT__}/scripts_files`

export const Paths = {
	Icons: `${files}/menu/icons`
} as const
