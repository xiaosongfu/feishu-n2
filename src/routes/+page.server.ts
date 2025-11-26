import { getNavLinks } from '$lib/server/feishu';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    const links = await getNavLinks();
    return {
        links
    };
};
