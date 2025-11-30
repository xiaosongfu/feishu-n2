import { FEISHU_APP_ID, FEISHU_APP_SECRET, FEISHU_BASE_ID, FEISHU_TABLE_ID } from '$env/static/private';

const TENANT_ACCESS_TOKEN_URL = 'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal';

interface FeishuRecord {
    fields: {
        分类: string;
        名称: Array<{ text: string; type: string }>;
        图标: { link: string; text: string; type: string };
        链接: { link: string; text: string; type: string };
    };
    record_id: string;
}

interface FeishuResponse<T> {
    code: number;
    msg: string;
    data: T;
}

async function getTenantAccessToken(): Promise<string> {
    const response = await fetch(TENANT_ACCESS_TOKEN_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            app_id: FEISHU_APP_ID,
            app_secret: FEISHU_APP_SECRET
        })
    });

    if (!response.ok) {
        throw new Error(`Failed to get tenant access token: ${response.statusText}`);
    }

    const data = await response.json();
    if (data.code !== 0) {
        throw new Error(`Feishu API Error: ${data.msg}`);
    }

    return data.tenant_access_token;
}

export async function getNavLinks() {
    try {
        const token = await getTenantAccessToken();
        // curl -i -X POST 'https://open.feishu.cn/open-apis/bitable/v1/apps/A560b3b4OalpKnsxC3ucdozsnJh/tables/tbl88Zfq2jgsXYmB/records/search?page_size=20&user_id_type=user_id' \
        // -H 'Content-Type: application/json' \
        // -H 'Authorization: Bearer t-g104bqn1UWULELNYRSCIDKPOWIWIVOBCHIFQKN7F' \
        // -d '{}'
        const url = `https://open.feishu.cn/open-apis/bitable/v1/apps/${FEISHU_BASE_ID}/tables/${FEISHU_TABLE_ID}/records/search`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                "sort": [
                    {
                        "desc": false,
                        "field_name": "排序"
                    }
                ]
            })
        });


        if (!response.ok) {
            throw new Error(`Failed to fetch records: ${response.statusText}`);
        }

        // {
        //   "code": 0,
        //   "data": {
        //     "has_more": false,
        //     "items": [
        //       {
        //         "fields": {
        //           "分类": "Dev",
        //           "名称": [
        //             {
        //               "text": "Tenderly",
        //               "type": "text"
        //             }
        //           ],
        //           "图标": {
        //             "link": "https://dashboard.tenderly.co/static/media/logo-symbol.svg",
        //             "text": "https://dashboard.tenderly.co/static/media/logo-symbol",
        //             "type": "url"
        //           },
        //           "序号": "1",
        //           "链接": {
        //             "link": "https://dashboard.tenderly.co/",
        //             "text": "https://dashboard.tenderly.co/",
        //             "type": "url"
        //           }
        //         },
        //         "record_id": "recG8w2VFC"
        //       },
        //     "total": 1
        //   },
        //   "msg": "success"
        // }
        const data: FeishuResponse<{ items: FeishuRecord[] }> = await response.json();
        if (data.code !== 0) {
            throw new Error(`Feishu API Error: ${data.msg}`);
        }

        // Normalize data
        return data.data.items.map((item) => {
            const fields = item.fields;

            // Extract name from array format
            const name = fields.名称 && fields.名称.length > 0 ? fields.名称[0].text : '';

            // Extract URL from object format
            const url = fields.链接?.link || '';

            // Extract icon from object format
            const icon = fields.图标?.link || '';

            // Extract category
            const category = fields.分类 || 'Uncategorized';

            return {
                id: item.record_id,
                name,
                url,
                icon,
                category
            };
        });
    } catch (error) {
        console.error('Error fetching navigation links:', error);
        return [];
    }
}
