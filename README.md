# Particles Wave Interaction Attributes for Webflow by Workshore Team

## Core Features
- 60FPS smooth wave animation
- rotate on 3D space based on pointer location on device screen

## Setup
Add script
```html
<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/wio-particle-wave/build/index.min.js" ></script>
```

## Attributes
- `data-wio-particle-wave` mandatory to enable Particles Wave Interaction on the element | should be set as `true`.
- `data-wio-interaction` to make interaction move user interactive | `true` or `false`, default is `false`.
- `data-wio-color` to change particle color | should be set as HEX value e.g. `#FFFFFF`, default is `#000000`
- `data-wio-speed` waving speed | between `0` and `1`, default is `0.1`
- `data-wio-fill-size` weather particle canvas use the css positioning | `true` or `false`. Default is `true`.
- `data-wio-initial-top-position` useful when needs to adjust the initial top view position. | `number` value, default is `-200`