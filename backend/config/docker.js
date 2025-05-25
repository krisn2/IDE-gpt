// config/docker.js
module.exports = {
  defaultImage: 'python:3.10-alpine',
  timeout: 30000, // 30 seconds
  maxContainers: 10,
  cleanup: {
    delay: 1000, // 1 second delay before cleanup
    forceRemove: true
  },
  volumes: {
    codeMount: '/code'
  }
};