package com.axellience.vuegwt.client.jsnative;

import jsinterop.annotations.JsFunction;

/**
 * Source: https://github.com/ltearno/angular2-gwt/
 */
@JsFunction
@FunctionalInterface
public interface JsPredicate<T>
{
    boolean execute(T value);
}