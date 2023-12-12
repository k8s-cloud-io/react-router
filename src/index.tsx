import React from "react"
import {BrowserHistory, createBrowserHistory} from "history";
import {HTMLAttributes, PropsWithChildren, createContext} from "react";
import {useContext, useEffect, useState} from "react";
import classnames from "classnames";
import {URLPattern} from "urlpattern-polyfill";

type KeyValueMap = {
    [key: string]: string;
}
export const RouterContext = createContext<{
    history: BrowserHistory,
    params: KeyValueMap,
    setParams: (p: KeyValueMap) => void
}>(null);
export const useRouter = () => {
    return useContext(RouterContext);
}
export const useHistory = () => {
    const r = useRouter();
    return r.history;
}
export const useNavigate = () => {
    const h = useHistory();
    return (url: string) => {
        h.replace(url);
    }
}
export const useParams = () => {
    const r = useRouter();
    return r.params;
}
const RouteProvider = (props: PropsWithChildren) => {
    const [children, setChildren] = useState(props?.children);
    const [currentChild, setCurrentChild] = useState(null);
    const r = useRouter();

    const updateView = () => {
        if( children ) {
            setCurrentChild(() => {
                r.setParams({});
                const baseURL = window.location.protocol.concat('//').concat(window.location.host);
                const location = window.location.href;
                for(const child of children as Array<any>) {
                    const pattern = new URLPattern({pathname: child.props.path, baseURL});
                    const compiled = pattern.exec(location)
                    if( compiled ) {
                        r.setParams(compiled.pathname.groups);
                        return child;
                    }
                }

                // TODO find default attribute on child
                return null;
            })
        }
    }

    r.history.listen((loc)=> {
        updateView();
    })

    useEffect(() => {
        updateView();
    }, [window.location.href]);

    return <>
        {
            currentChild
        }
        {
            !children &&
            props.children
        }
    </>
}
export const Router = (props: any) => {
    const history = createBrowserHistory();
    const [params, setParams] = useState({})
    return <RouterContext.Provider value={{history, params, setParams}}>
        <RouteProvider>
            {props.children}
        </RouteProvider>
    </RouterContext.Provider>
}
export const Link = (props: any) => {
    let className = classnames(props.className as string);
    const location = window.location.pathname;
    const navigate = useNavigate();

    if (location === props.href || location.startsWith(props.href as string)) {
        className = classnames(className, props.activeClassName);
    }

    return (
        <a
            href={props.href}
            className={className}
            onClick={(evt) => {
                evt.stopPropagation();
                evt.preventDefault();
                navigate(props.href as string);
            }}
        >
            {props.children}
        </a>
    );
};