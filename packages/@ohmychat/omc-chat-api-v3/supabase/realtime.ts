/**
 * Écoute les changements sur les tables de la base de données Supabase
 * et appelle les fonctions de changement correspondantes.
 *
 * Les changements écoutés sont :
 * - INSERT et UPDATE sur la table `chat_group_messages`
 * - INSERT et UPDATE sur la table `chat_group_typing`
 * - INSERT et UPDATE sur la table `chat_group_members`
 * - INSERT et UPDATE sur la table `chat_groups`
 * - INSERT et UPDATE sur la table `users`
 *
 * Les fonctions de changement appelées sont :
 * - messagesChanges pour les changements sur `chat_group_messages`
 * - typingChanges pour les changements sur `chat_group_typing`
 * - membersChanges pour les changements sur `chat_group_members`
 * - groupChanges pour les changements sur `chat_groups`
 * - userChanges pour les changements sur `users`
 */
import { supabase } from "@ohmychat/ohmychat-backend-core";
import { messagesChanges } from "../changes/messages";
import { membersChanges } from "../changes/members";
import { userChanges } from "../changes/users";
import { groupChanges } from "../changes/groups";
import { typingChanges } from "../changes/typing";

supabase.channel('ohmychat-realtime-messages')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_group_messages' }, messagesChanges)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'chat_group_messages' }, messagesChanges)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_group_typing' }, typingChanges)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'chat_group_typing' }, typingChanges)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_group_members' }, membersChanges)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'chat_group_members' }, membersChanges)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_groups' }, groupChanges)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'chat_groups' }, groupChanges)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'users' }, userChanges)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'users' }, userChanges)
    .subscribe();
