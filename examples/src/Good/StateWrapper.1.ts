import { createElement, FunctionComponent, ReactNode } from "react";

export default
        <P>(component: FunctionComponent<P>) => {
            const StateWrapper = function(props: P & { readonly children?: ReactNode }) {
                return createElement(component, props);
            };

            return StateWrapper;
        };
