import { importsPath, readJsonSync } from '@/lib/data/platform-storage';
import { existsSync, readdirSync } from 'node:fs';
import type { PublicDirectoryResult } from './services';
import { usStates } from '@/lib/us-states';

type Entity = { id: string; type: string; sourceUrl?: string; fields?: Array<{name:string;value:string}>; raw?: {reviewStatus?:string; sourceName?:string} };
type ImportFile = {sourceRegistry?: {state?:string;source_name?:string}; fetchedAt?:string; entities?:Entity[]};
const groups: Record<string,PublicDirectoryResult['group']> = {school:'Schools',team:'Teams',player:'Athletes',athlete:'Athletes',coach:'Coaches',game:'Games',stat:'Rankings'};
export function getSmartPullDirectoryResults(): PublicDirectoryResult[] {
  const dir=importsPath();
  if (!existsSync(dir)) return [];
  const found=new Map<string,PublicDirectoryResult>();
  for (const filename of readdirSync(dir).filter(name=>name.startsWith('deep-import-') && name.endsWith('.json')).slice(-300)) {
    const data=readJsonSync<ImportFile|null>(importsPath(filename),null);
    if (!data?.entities) continue;
    const state=usStates.find(s=>s.name.toLowerCase()===data.sourceRegistry?.state?.toLowerCase() || s.code.toLowerCase()===data.sourceRegistry?.state?.toLowerCase());
    for (const entity of data.entities) {
      const group=groups[entity.type];
      if (!group) continue;
      const fields=Object.fromEntries((entity.fields||[]).map(f=>[f.name,f.value]));
      const title=fields.name || fields.athleteName || fields.teamName;
      if (!title || (entity.raw?.reviewStatus || fields.reviewStatus)!=='auto_commit_ready') continue;
      const key=[group,state?.code||'US',title.toLowerCase()].join(':');
      found.set(key,{id:'smart-pull-'+entity.id,title,detail:[state?.code,data.sourceRegistry?.source_name,'Smart Pull public record'].filter(Boolean).join(' - '),href:'/search?q='+encodeURIComponent(title),group,typeLabel:'Smart Pull '+entity.type,sourceLabel:'Public Record',sourceUrl:entity.sourceUrl,importedAt:data.fetchedAt,stateCode:state?.code});
    }
  }
  return [...found.values()];
}
