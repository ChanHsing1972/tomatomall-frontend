// vite.config.ts
import {
    defineConfig
} from "file:///D:/Schnappi/NJU%20Files/%E8%BD%AF%E5%B7%A5%E2%85%A1/tomatomall-frontend/node_modules/vite/dist/node/index.js";
import vue
    from "file:///D:/Schnappi/NJU%20Files/%E8%BD%AF%E5%B7%A5%E2%85%A1/tomatomall-frontend/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import AutoImport
    from "file:///D:/Schnappi/NJU%20Files/%E8%BD%AF%E5%B7%A5%E2%85%A1/tomatomall-frontend/node_modules/unplugin-auto-import/dist/vite.js";
import Components
    from "file:///D:/Schnappi/NJU%20Files/%E8%BD%AF%E5%B7%A5%E2%85%A1/tomatomall-frontend/node_modules/unplugin-vue-components/dist/vite.mjs";
import {
    ElementPlusResolver
} from "file:///D:/Schnappi/NJU%20Files/%E8%BD%AF%E5%B7%A5%E2%85%A1/tomatomall-frontend/node_modules/unplugin-vue-components/dist/resolvers.mjs";

var vite_config_default = defineConfig({
    plugins: [
        vue(),
        AutoImport({
            resolvers: [ElementPlusResolver()]
        }),
        Components({
            resolvers: [ElementPlusResolver()]
        })
    ],
    server: {
        port: 3e3,
        //设定前端运行的端口
        open: true
    },
    base: "./"
});
export {
    vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxTY2huYXBwaVxcXFxOSlUgRmlsZXNcXFxcXHU4RjZGXHU1REU1XHUyMTYxXFxcXHRvbWF0b21hbGwtZnJvbnRlbmRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXFNjaG5hcHBpXFxcXE5KVSBGaWxlc1xcXFxcdThGNkZcdTVERTVcdTIxNjFcXFxcdG9tYXRvbWFsbC1mcm9udGVuZFxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovU2NobmFwcGkvTkpVJTIwRmlsZXMvJUU4JUJEJUFGJUU1JUI3JUE1JUUyJTg1JUExL3RvbWF0b21hbGwtZnJvbnRlbmQvdml0ZS5jb25maWcudHNcIjtpbXBvcnQge2RlZmluZUNvbmZpZ30gZnJvbSAndml0ZSdcclxuaW1wb3J0IHZ1ZSBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUnXHJcblxyXG4vLyBFbGVtZW50IFVJIFx1ODFFQVx1NTJBOFx1NUJGQ1x1NTE2NVx1NjUyRlx1NjMwMVxyXG5pbXBvcnQgQXV0b0ltcG9ydCBmcm9tICd1bnBsdWdpbi1hdXRvLWltcG9ydC92aXRlJ1xyXG5pbXBvcnQgQ29tcG9uZW50cyBmcm9tICd1bnBsdWdpbi12dWUtY29tcG9uZW50cy92aXRlJ1xyXG5pbXBvcnQge0VsZW1lbnRQbHVzUmVzb2x2ZXJ9IGZyb20gJ3VucGx1Z2luLXZ1ZS1jb21wb25lbnRzL3Jlc29sdmVycydcclxuXHJcbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XHJcbiAgICBwbHVnaW5zOiBbXHJcbiAgICAgICAgdnVlKCksXHJcbiAgICAgICAgQXV0b0ltcG9ydCh7XHJcbiAgICAgICAgICAgIHJlc29sdmVyczogW0VsZW1lbnRQbHVzUmVzb2x2ZXIoKV0sXHJcbiAgICAgICAgfSksXHJcbiAgICAgICAgQ29tcG9uZW50cyh7XHJcbiAgICAgICAgICAgIHJlc29sdmVyczogW0VsZW1lbnRQbHVzUmVzb2x2ZXIoKV0sXHJcbiAgICAgICAgfSldLFxyXG4gICAgc2VydmVyOiB7XHJcbiAgICAgICAgcG9ydDogMzAwMCwgICAvL1x1OEJCRVx1NUI5QVx1NTI0RFx1N0FFRlx1OEZEMFx1ODg0Q1x1NzY4NFx1N0FFRlx1NTNFM1xyXG4gICAgICAgIG9wZW46IHRydWUsXHJcbiAgICB9LFxyXG4gICAgYmFzZTogJy4vJ1xyXG59KVxyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTZWLFNBQVEsb0JBQW1CO0FBQ3hYLE9BQU8sU0FBUztBQUdoQixPQUFPLGdCQUFnQjtBQUN2QixPQUFPLGdCQUFnQjtBQUN2QixTQUFRLDJCQUEwQjtBQUdsQyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUN4QixTQUFTO0FBQUEsSUFDTCxJQUFJO0FBQUEsSUFDSixXQUFXO0FBQUEsTUFDUCxXQUFXLENBQUMsb0JBQW9CLENBQUM7QUFBQSxJQUNyQyxDQUFDO0FBQUEsSUFDRCxXQUFXO0FBQUEsTUFDUCxXQUFXLENBQUMsb0JBQW9CLENBQUM7QUFBQSxJQUNyQyxDQUFDO0FBQUEsRUFBQztBQUFBLEVBQ04sUUFBUTtBQUFBLElBQ0osTUFBTTtBQUFBO0FBQUEsSUFDTixNQUFNO0FBQUEsRUFDVjtBQUFBLEVBQ0EsTUFBTTtBQUNWLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
