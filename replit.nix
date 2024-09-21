{ pkgs }: {
	deps = [
   pkgs.vue
		pkgs.nodejs
        pkgs.nodePackages.typescript-language-server
        pkgs.yarn
	];
}