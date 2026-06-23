// React 19's @types removed the global `JSX` namespace in favour of `React.JSX`.
// This shim restores the global so `JSX.Element` return annotations keep working
// across the renderer without importing React in every file.
import type * as React from 'react'

declare global {
  namespace JSX {
    type Element = React.JSX.Element
    type ElementClass = React.JSX.ElementClass
    type ElementAttributesProperty = React.JSX.ElementAttributesProperty
    type ElementChildrenAttribute = React.JSX.ElementChildrenAttribute
    type IntrinsicAttributes = React.JSX.IntrinsicAttributes
    type IntrinsicClassAttributes<T> = React.JSX.IntrinsicClassAttributes<T>
    type IntrinsicElements = React.JSX.IntrinsicElements
    type LibraryManagedAttributes<C, P> = React.JSX.LibraryManagedAttributes<C, P>
  }
}
