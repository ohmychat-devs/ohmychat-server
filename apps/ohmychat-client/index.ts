import { server } from "@ohmychat/ohmychat-backend-core";

import "@ohmychat/ohmychat-chat-api-v2";
import "@ohmychat/ohmychat-auth-api";
import "@ohmychat/ohmychat-search-api";
import "@ohmychat/ohmychat-relations-api";
import "@ohmychat/ohmychat-users-api";
import "@ohmychat/ohmychat-stories-api";

const port = process.env.PORT || 80;
server.listen(port, async () => {
    console.log(`Listening on port ${port}`);
});