const getAnonymousId = () => {
  let anonId = localStorage.getItem('analytics_anonymous_id');
  if (!anonId) {
    anonId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('analytics_anonymous_id', anonId);
  }
  return anonId;
};

class AnalyticsSDK {
  constructor() {
    this.apiUrl = '/v1';
    this.projectId = null;
    this.userId = null;
    this.anonymousId = getAnonymousId();
    this.batch = [];
    this.batchInterval = 3000;
    this.timer = null;
    this.isFlushing = false;
  }

  init(projectId, options = {}) {
    this.projectId = projectId;
    if (options.apiUrl) this.apiUrl = options.apiUrl;
    if (options.batchInterval) this.batchInterval = options.batchInterval;
    
    console.log(`[Analytics] Initialized for project: ${this.projectId}`);
  }

  identify(userId) {
    this.userId = userId;
    fetch(`${this.apiUrl}/track/identify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project_id: this.projectId,
        anonymous_id: this.anonymousId,
        user_id: this.userId
      })
    }).catch(console.error);
  }

  track(eventName, properties = {}) {
    if (!this.projectId) {
      console.warn('Analytics not initialized. Call init() first.');
      return;
    }

    const event = {
      project_id: this.projectId,
      user_id: this.userId,
      anonymous_id: this.anonymousId,
      event_name: eventName,
      properties: {
        ...properties,
        page_url: window.location.href,
        user_agent: navigator.userAgent
      }
    };

    this.batch.push(event);

    if (!this.timer) {
      this.timer = setTimeout(() => this.flush(), this.batchInterval);
    }
  }

  async flush() {
    if (this.batch.length === 0 || this.isFlushing) return;

    this.isFlushing = true;
    const currentBatch = [...this.batch];
    this.batch = [];
    clearTimeout(this.timer);
    this.timer = null;

    try {
      const response = await fetch(`${this.apiUrl}/track/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: currentBatch })
      });

      if (!response.ok) {
        throw new Error('Failed to send batch');
      }
    } catch (error) {
      console.error('Analytics flush error:', error);
      this.batch = [...currentBatch, ...this.batch];
    } finally {
      this.isFlushing = false;
      if (this.batch.length > 0 && !this.timer) {
        this.timer = setTimeout(() => this.flush(), this.batchInterval);
      }
    }
  }
}

export const analytics = new AnalyticsSDK();
