// elasticsearch.service.ts

import { Client } from '@elastic/elasticsearch';

/**
 * ElasticSearchService wraps việc khởi tạo và sử dụng Elasticsearch client
 */
class ElasticsearchService {
  private client: Client;

  constructor() {
    this.client = new Client({
      node: process.env.ES_NODE || 'http://localhost:9200',
    });
    console.log('Elasticsearch client initialized with node:', process.env.ES_NODE);
  }

  /**
   * Kiểm tra kết nối đến Elasticsearch
   */
  public async ping(): Promise<boolean> {
    try {
      await this.client.ping();
      return true;
    } catch (error) {
      console.error('Elasticsearch ping failed:', error);
      return false; 
    }
  }

  /**
   * Tìm document theo index và id
   */
  public async get<T = any>(index: string, id: string): Promise<T | null> {
    try {
      const resp = await this.client.get<T>({ index, id });
      // @ts-ignore: _source có thể không xác định kiểu
      return resp._source ?? null;
    } catch (error: any) {
      if (error.meta && error.meta.statusCode === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Tạo hoặc cập nhật document
   */
   public async index<T extends Record<string, any>>(index: string, id: string, document: T): Promise<void> {
        await this.client.index({
        index,
        id,
        body: document,
        refresh: 'wait_for'
        });
    }

  /**
   * Search documents trong index
   */
  public async search<T = any>(index: string, query: any): Promise<T[]> {
    const resp = await this.client.search({
      index,
      body: query
    });
    // @ts-ignore: _source có thể không xác định kiểu
    return resp.body.hits.hits.map((hit: any) => hit._source);
  }

  /**
   * Bulk operations
   */
  public async bulk(operations: any[]): Promise<any> {
    const resp = await this.client.bulk({ body: operations });
    return resp;
  }

  /**
   * Truy cập client gốc nếu cần những API chưa được wrap
   */
  public getClient(): Client {
    return this.client;
  }
}

export default new ElasticsearchService();
