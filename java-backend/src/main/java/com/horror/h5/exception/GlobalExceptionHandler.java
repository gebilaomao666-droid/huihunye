package com.horror.h5.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.Map;

/**
 * 全局异常兜底。
 * 仅捕获"抛出的"未处理异常, 把 500 裸栈转成干净 JSON;
 * 不影响 Controller 里刻意返回的 Map.of("error", ...) 正常响应。
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    // 入参类型不对 (如 ?limit=abc) -> 400 而非 500
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<Map<String, Object>> handleBadParam(MethodArgumentTypeMismatchException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", "请求参数无效", "param", e.getName()));
    }

    // 兜底: 未捕获异常一律转干净 JSON, 不向客户端暴露堆栈
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleAny(Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "服务器内部错误", "type", e.getClass().getSimpleName()));
    }
}
