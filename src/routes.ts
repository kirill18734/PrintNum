import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  layout("routes/layout.tsx", [
    index("routes/home.tsx"),
    route("settings", "routes/settings/index.tsx"),
  ]),
  route("action/set-theme", "routes/action.set-theme.tsx"),
  route("action/set-theme-style", "routes/action.set-theme-style.tsx"),
  route("action/set-config", "routes/action.set-config.tsx"),
] satisfies RouteConfig;
