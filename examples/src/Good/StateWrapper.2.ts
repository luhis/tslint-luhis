import { createElement, FunctionComponent, ReactNode } from "react";

export default
        <P>(component: FunctionComponent<P>) => {
            function StateWrapper(props: P & { readonly children?: ReactNode }) {
                return createElement(component, props);
            }

            return StateWrapper;
        };
