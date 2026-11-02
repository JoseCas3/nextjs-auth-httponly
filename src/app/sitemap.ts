import type {MetadataRoute} from 'next';
import {siteUrl} from '@/lib/env';
export default function sitemap():MetadataRoute.Sitemap{return [{url:siteUrl(),changeFrequency:'monthly',priority:1},{url:`${siteUrl()}/privacidad`,changeFrequency:'yearly',priority:0.3}];}
