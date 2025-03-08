# Dynamic Layout System

This directory contains components for rendering dynamic layouts based on JSON configuration. The system uses Angular CDK's Portal and Overlay modules to create flexible, runtime-configurable UI layouts.

## Components

### DynamicLayoutComponent

The main component that orchestrates the rendering of a complete layout based on the layout name provided. It fetches the layout configuration from the DesignService and renders the appropriate components.

```typescript
<app-dynamic-layout layoutName="default"></app-dynamic-layout>
```

### DynamicHeaderComponent

Renders the header section of a layout, including logo, navigation, and user menu components.

### DynamicSidebarComponent

Renders a collapsible sidebar with navigation menu items.

### DynamicFooterComponent

Renders the footer section of a layout.

### DynamicCardComponent

Renders a card component with a title and content.

### DynamicGridComponent

Renders a grid layout with configurable columns and gap.

### DynamicFlexComponent

Renders a flex layout with configurable direction.

## Usage

To use the dynamic layout system, you need to:

1. Define your layout in the `design.json` file
2. Use the `DynamicLayoutComponent` in your component template
3. Pass the name of the layout you want to render

Example:

```typescript
import { Component } from '@angular/core';
import { DynamicLayoutComponent } from '../../shared/components/dynamic-layout/dynamic-layout.component';

@Component({
  selector: 'app-my-page',
  standalone: true,
  imports: [DynamicLayoutComponent],
  template: `
    <app-dynamic-layout layoutName="dashboard">
      <!-- Additional content can be projected here -->
    </app-dynamic-layout>
  `
})
export class MyPageComponent {}
```

## Extending

To add support for new component types:

1. Create a new component in the `components` directory
2. Update the `DynamicLayoutComponent` to include the new component
3. Add the appropriate rendering logic in the template

## Theming

The dynamic layout components use CSS variables defined by the active theme in the DesignService. This allows for runtime theme switching without reloading the application. 