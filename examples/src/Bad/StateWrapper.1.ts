import { createElement, FunctionComponent, ReactNode } from "react";

export default
        <P>(component: FunctionComponent<P>) => {
            return (props: P & { readonly children?: ReactNode }) => {
                return createElement(component, props);
            };
        };
