import { Observable } from "@legendapp/state";
import { Store } from "../types";
import { chatList } from "./chatList";

export function chatStore (store: Observable<Store>) {
    return {
        chatList$ : chatList(store)
    }
}
