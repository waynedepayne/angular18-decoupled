# Instruction for Angular 18 Enterprise App Implementation

"For the Angular 18 enterprise app project, generate the implementation for the first 5 JSON files: `config.json`, `design.json`, `router.json`, `logic.json`, and `rules.json`. For each JSON:  

1. Create a sample JSON file with a structure reflecting its purpose (e.g., feature flags for `config.json`, UI layouts for `design.json`, routes for `router.json`, workflows for `logic.json`, form definitions for `rules.json`).  

2. Develop a dedicated Angular service in `app/core/services/` (e.g., `ConfigService`, `DesignService`, `RouterConfigService`, `LogicService`, `RulesService`) to fetch the JSON via `HttpClient` and expose it using RxJS Observables or Signals, integrating `APP_INITIALIZER` for runtime loading. 

3. Define TypeScript interfaces in `app/core/models/` (e.g., `ConfigModel`, `DesignModel`, `RouterModel`, `LogicModel`, `RulesModel`) for type safety.  

4. Provide application logic demonstrating service integration with feature modules (e.g., global settings for `config.json`, dynamic UI for `design.json`, routing for `router.json`, workflows for `logic.json`, dynamic forms with Formly for `rules.json`).  

5. Utilize recommended tools from the project’s 'Potential Tools' section (e.g., NgRx/Akita for `config.json`, Angular CDK for `design.json`, Angular Router for `router.json`, NgRx/xstate for `logic.json`, Angular Formly for `rules.json`).  

6. Include a frontend testing setup with Microsoft tools (e.g., Playwright for E2E tests) to validate the JSON-driven functionality, meeting client requirements.  
7. Focus on one JSON at a time, ensuring runtime configurability and a decoupled architecture as outlined in the project goals."