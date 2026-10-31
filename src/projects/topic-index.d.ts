// The module vite.config.ts builds from src/data/topics/*.json.
declare module 'virtual:topic-index' {
  const index: import('./model').TopicIndex[]
  export default index
}
