/** @type {import('next').NextConfig} */
// next.config.js
module.exports = {
    webpack: (config, { isServer }) => {
      // 필요한 경우, 특정 모듈에 대한 alias를 설정할 수 있습니다.
      if (!isServer) {
        config.resolve.alias['@radix-ui/react-slot'] = require.resolve('@radix-ui/react-slot');
        config.resolve.alias['class-variance-authority'] = require.resolve('class-variance-authority');
      }
  
      // 항상 수정된 config를 반환해야 합니다.
      return config;
    },
  };
  