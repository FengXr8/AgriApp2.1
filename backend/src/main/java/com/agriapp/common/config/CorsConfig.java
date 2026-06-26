package com.agriapp.common.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

/**
 * 全局 CORS 跨域配置
 * 
 * 允许前端开发环境访问后端 API
 */
@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        
        // 允许所有来源 patterns（开发环境使用）
        config.addAllowedOriginPattern("*");
        
        // 允许所有请求头
        config.addAllowedHeader("*");
        
        // 允许所有 HTTP 方法
        config.addAllowedMethod("*");
        
        // 是否允许携带凭证（cookies）
        // 由于使用了 allowedOriginPattern("*")，这里不能设置为 true
        config.setAllowCredentials(false);
        
        // 预检请求缓存时间
        config.setMaxAge(3600L);
        
        // 暴露响应头（允许客户端访问的响应头）
        config.addExposedHeader("Authorization");
        config.addExposedHeader("Content-Type");
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        
        return new CorsFilter(source);
    }
}
