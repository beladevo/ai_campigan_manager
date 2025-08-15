# שאלות ריאיון - מערכת Solara AI Mini System

## שאלות קלות (Easy)

### 1. איך מתחילים את המערכת?
**תשובה:** 
```bash
docker-compose up --build
```
הפקודה מתחילה את כל השירותים: RabbitMQ, PostgreSQL, NestJS, Python Generator, Python Worker.

### 2. איזה פורטים משתמשת המערכת?
**תשובה:**
- NestJS Service: 3000
- Python Generator: 8000  
- PostgreSQL: 5432
- RabbitMQ: 5672 (AMQP), 15672 (Management UI)

### 3. איזה מסד נתונים אתה משתמש?
**תשובה:** PostgreSQL 15 עם מסד נתונים בשם `solara` שמכיל טבלת campaigns.

### 4. איזה מודל AI אתה משתמש?
**תשובה:** Google Gemini 2.0 Flash לטקסט ו- Gemini 2.0 Flash Preview Image Generation לתמונות.

### 5. איזה סטטוסים יש לקמפיין?
**תשובה:** PENDING, PROCESSING, COMPLETED, FAILED.

### 6. איפה נשמרות התמונות שנוצרות?
**תשובה:** בתיקייה `output/` עם שם `campaign_{campaignId}_{randomHash}.png`.

### 7. איזה message broker אתה משתמש?
**תשובה:** RabbitMQ עם exchange `solara.campaigns` ו-queues `campaign.generate` ו-`campaign.result`.

### 8. איך בודקים health של השירותים?
**תשובה:** 
- Python Generator: `GET /health`
- NestJS: בדיקות health check בוויטב docker-compose

### 9. איזה endpoints יש ב-NestJS?
**תשובה:**
- `POST /campaigns` - יצירת קמפיין חדש
- `GET /campaigns/:id` - קבלת סטטוס וחוצצי תוצאות

### 10. איזה כלים אתה משתמש לפיתוח?
**תשובה:** NestJS, FastAPI, Docker, TypeORM, RabbitMQ, PostgreSQL, Python 3.x, Node.js.

## שאלות בינוניות (Medium)

### 11. תסביר את ה-data flow של המערכת.
**תשובה:**
1. Client שולח POST /campaigns לשירות NestJS
2. NestJS יוצר record במסד נתונים עם סטטוס PENDING
3. NestJS מפרסם message ל-RabbitMQ queue `campaign.generate`
4. NestJS מעדכן סטטוס ל-PROCESSING ומחזיר תגובה מיידית
5. Python Worker צורך את המסר מה-queue
6. Python Worker שולח בקשה HTTP ל-Python Generator
7. Python Generator מייצר תוכן עם Gemini AI
8. Python Worker מפרסם תוצאה ל-queue `campaign.result`
9. NestJS צורך תוצאה ומעדכן מסד נתונים
10. Client עושה polling עם GET /campaigns/:id

### 12. למה בחרת בארכיטקטורת queue במקום HTTP ישיר?
**תשובה:**
- **Horizontal Scaling**: ניתן להפעיל מספר Python workers במקביל
- **Reliability**: הודעות נשמרות ולא הולכות לאיבוד
- **Decoupling**: שירותים מתקשרים דרך message broker אמין
- **Resource Utilization**: אין חסימת HTTP connections במהלך יצירת AI

### 13. איך מטפלים בשגיאות במערכת?
**תשובה:**
- **Queue-level reliability**: RabbitMQ מבטיח משלוח הודעות
- **Worker error handling**: Python Worker שולח הודעות שגיאה דרך queue
- **Graceful degradation**: fallback לתמונות placeholder משופרות
- **Database consistency**: קמפיינים כושלים מסומנים FAILED עם הודעת שגיאה
- **Structured logging**: מזהה קמפיין לאורך כל התהליך

### 14. מה היתרונות של הפרדת Python Generator ו-Python Worker?
**תשובה:**
- **Separation of Concerns**: Worker מטפל ב-queues, Generator בAI
- **Independent Scaling**: ניתן להגדיל כל שירות בנפרד
- **Resource Management**: Generator יכול להתמקד ביצירת תוכן
- **Fault Isolation**: בעיות בqueue לא משפיעות על AI generation

### 15. איך המערכת מטפלת בload balancing?
**תשובה:**
- RabbitMQ מחלק הודעות בין multiple Python Workers
- ניתן להפעיל מספר instances של כל שירות
- Docker Compose מאפשר scaling עם `docker-compose up --scale`

### 16. מה ה-environment variables הנדרשים?
**תשובה:**
- `GEMINI_API_KEY`: מפתח API לGoogle Gemini
- `POSTGRES_HOST`: כתובת מסד נתונים
- `RABBITMQ_URL`: חיבור RabbitMQ
- `GENERATOR_URL`: כתובת Python Generator (python-worker)

### 17. איך מבצעים debug של הודעות RabbitMQ?
**תשובה:**
- RabbitMQ Management UI: http://localhost:15672
- בדיקת queues ו-exchanges
- מעקב אחר הודעות וconsumers
- לוגים ב-Python Worker ו-NestJS Service

### 18. מה קורה אם Python Generator לא זמין?
**תשובה:**
- Python Worker מקבל HTTP error
- Worker שולח הודעת שגיאה ל-queue `campaign.result`
- NestJS מעדכן קמפיין ל-FAILED status
- Client רואה שגיאה בpolling

## שאלות קשות (Very Hard)

### 19. איך תטפל במצב של high throughput עם אלפי בקשות לדקה?
**תשובה:**
- **Horizontal Scaling**: הגדלת מספר Python Workers ו-Generators
- **Queue Partitioning**: חלוקת queues לפי סוגי עבודה
- **Database Connection Pooling**: אופטימיזציה של חיבורי PostgreSQL
- **Caching Layer**: Redis לתוצאות נפוצות
- **Load Balancer**: HAProxy/Nginx מול multiple NestJS instances
- **Batch Processing**: עיבוד מספר קמפיינים יחד
- **Rate Limiting**: הגבלת בקשות per user

### 20. מה יקרה אם RabbitMQ ייפול באמצע עיבוד?
**תשובה:**
- **Message Persistence**: הודעות נשמרות על disk
- **Acknowledgment Strategy**: הודעות לא נמחקות עד אישור עיבוד
- **Clustering**: הגדרת RabbitMQ cluster לHigh Availability
- **Dead Letter Queues**: הודעות כושלות עוברות לqueue נפרד
- **Circuit Breaker Pattern**: זיהוי כשל והפסקת נסיונות
- **Exponential Backoff**: המתנה הדרגתית בין נסיונות חיבור

### 21. איך תעצב מערכת monitoring ו-observability?
**תשובה:**
- **Metrics**: Prometheus עם Grafana לdashboards
- **Logging**: ELK Stack (Elasticsearch, Logstash, Kibana)
- **Tracing**: Jaeger לdistributed tracing
- **Health Checks**: endpoint בכל שירות עם detailed status
- **Alerting**: PagerDuty/Slack integration לשגיאות קריטיות
- **Business Metrics**: מעקב אחר generation success rate, latency

### 22. איך תטמע authentication ו-authorization?
**תשובה:**
- **JWT Tokens**: אימות משתמשים ב-NestJS
- **API Gateway**: Kong/AWS API Gateway עם rate limiting
- **RBAC**: הגדרת תפקידים לפי סוגי משתמשים
- **OAuth 2.0**: אינטגרציה עם Google/Facebook
- **Service-to-Service**: API keys או mutual TLS בין microservices
- **Audit Logging**: מעקב אחר פעולות משתמשים

### 23. איך תעצב disaster recovery strategy?
**תשובה:**
- **Database Backup**: PostgreSQL automated backups + point-in-time recovery
- **Cross-Region Replication**: העתקת נתונים למספר regions
- **Infrastructure as Code**: Terraform/CloudFormation לrecreation מהיר
- **Blue-Green Deployment**: החלפה בין environments
- **RTO/RPO Planning**: הגדרת יעדי זמן recovery
- **Regular DR Drills**: בדיקות תקופתיות של תהליכי שחזור

### 24. איך תטפל בcost optimization לAI API calls?
**תשובה:**
- **Prompt Optimization**: קיצור prompts מבלי לפגוע באיכות
- **Caching Strategy**: שמירת תוצאות לprompts דומים
- **Batch Processing**: עיבוד מספר בקשות יחד
- **Model Selection**: שימוש במודלים זולים יותר למשימות פשוטות
- **Request Deduplication**: זיהוי בקשות זהות
- **Usage Analytics**: מעקב ואופטימיזציה של עלויות

### 25. איך תבטיח data consistency בין microservices?
**תשובה:**
- **Saga Pattern**: compensation transactions לכשלים
- **Event Sourcing**: שמירת כל השינויים כevents
- **Two-Phase Commit**: לעסקאות קריטיות
- **Eventual Consistency**: קבלת עיכובים קטנים
- **Outbox Pattern**: שמירת הודעות עם נתונים באותה transaction
- **CQRS**: הפרדת read/write operations

### 26. איך תעצב A/B testing למודלי AI שונים?
**תשובה:**
- **Feature Flags**: LaunchDarkly/Unleash לswitch בין מודלים
- **Traffic Splitting**: חלוקת תעבורה לפי אחוזים
- **Metrics Collection**: השוואת איכות תוצאות
- **Statistical Significance**: חישוב מתי תוצאות משמעותיות
- **Gradual Rollout**: הגדלה הדרגתית של exposure
- **Rollback Strategy**: חזרה מהירה למודל קודם

### 27. איך תטמע multi-tenancy במערכת?
**תשובה:**
- **Database Isolation**: schema נפרד לכל tenant
- **Shared Resources**: queues עם tenant identifier
- **Resource Quotas**: הגבלת שימוש לכל tenant
- **Billing Integration**: מעקב אחר usage per tenant
- **Security Isolation**: הפרדה מלאה בין tenants
- **Custom Configuration**: הגדרות ייעודיות לכל tenant

### 28. איך תשפר את ביצועי הmessage processing?
**תשובה:**
- **Prefetch Count**: אופטימיזציה של כמות הודעות בבת אחת
- **Consumer Concurrency**: multiple threads per worker
- **Message Batching**: עיבוד הודעות בחבילות
- **Queue Optimization**: הגדרות RabbitMQ מותאמות
- **Async Processing**: שימוש באסינכרוניות מקסימלית
- **Memory Management**: ניהול זיכרון יעיל בPython

### 29. איך תבטיח security ברמת microservices?
**תשובה:**
- **Network Segmentation**: VPC עם security groups
- **Service Mesh**: Istio/Linkerd עם mTLS
- **Secret Management**: HashiCorp Vault/AWS Secrets Manager
- **Container Security**: סריקת vulnerabilities בimages
- **API Rate Limiting**: הגנה מפני DDoS
- **Input Validation**: sanitization של כל הקלטות
- **Audit Trails**: לוגים מלאים לכל פעולה

### 30. איך תבצע migration למערכת cloud-native?
**תשובה:**
- **Containerization**: המרה מלאה לDocker containers
- **Kubernetes Deployment**: Helm charts ו-operators
- **Managed Services**: RDS, SQS/SNS, ElastiCache
- **Auto-scaling**: HPA ו-VPA לקוברנטיס
- **Service Discovery**: Consul/Kubernetes DNS
- **GitOps**: ArgoCD/Flux לdeployment
- **Progressive Migration**: החלפה הדרגתית של רכיבים

### 31. איך תמדוד ותשפר את איכות התוכן שנוצר?
**תשובה:**
- **Content Quality Metrics**: בדיקת coherence, relevance, creativity
- **A/B Testing**: השוואת מודלים שונים
- **Human Feedback**: אינטגרציה של human-in-the-loop
- **Automatic Evaluation**: מטריקות כמו BLEU, ROUGE
- **User Engagement**: מעקב אחר clicks, conversions
- **Feedback Loop**: שיפור prompts על סיס תוצאות

### 32. איך תעצב blue-green deployment לmicroservices?
**תשובה:**
- **Environment Duplication**: two identical environments
- **Database Migration Strategy**: schema changes backwards compatible
- **Traffic Switching**: load balancer routing change
- **Rollback Plan**: מעבר מהיר חזרה לgreen
- **Health Checks**: ביצציהות comprehensive לפני switch
- **Data Synchronization**: sync critical data between environments
- **Feature Flags**: הדרגתי enable של features חדשות

### 33. איך תטמע real-time notifications לסטטוס קמפיינים?
**תשובה:**
- **WebSocket Connections**: Socket.io לupdates בזמן אמת
- **Server-Sent Events**: חלופה פשוטה יותר
- **Push Notifications**: FCM/APNS למובייל
- **Email Notifications**: SendGrid/SES לעדכונים
- **Event Broadcasting**: Redis Pub/Sub או RabbitMQ fanout
- **Connection Management**: טיפול בreconnection ו-heartbeats

### 34. איך תבנה automated testing strategy?
**תשובה:**
- **Unit Tests**: Jest (NestJS), pytest (Python)
- **Integration Tests**: test containers לmicroservices
- **End-to-End Tests**: Cypress/Playwright
- **Contract Testing**: Pact לapi compatibility
- **Load Testing**: k6/JMeter לperformance
- **Chaos Engineering**: Gremlin לresilience testing
- **CI/CD Pipeline**: automated testing בכל commit

### 35. איך תבצע capacity planning למערכת?
**תשובה:**
- **Load Modeling**: חישוב expected traffic patterns
- **Resource Metrics**: CPU, memory, network, storage usage
- **Bottleneck Analysis**: זיהוי צווארי בקבוק
- **Scaling Calculations**: מתי להוסיף resources
- **Cost Analysis**: optimization של cloud costs
- **Growth Projections**: תחזיות לגידול המערכת
- **Performance Testing**: simulation של load scenarios

## שאלות Senior Level - Deep Technical

### 36. מה היתרונות של worker pattern שבחרת לעומת direct API calls?
**תשובה:**
- **Resilience**: הודעות לא הולכות לאיבוד אם השירות נופל
- **Back-pressure Management**: queue מבוסס מטפל בעומס יתר טוב מHTTP timeouts
- **Resource Optimization**: workers יכולים לעבוד במקביל ללא חסימת connections
- **Fault Isolation**: כשל ב-generator לא משפיע על acceptance של בקשות חדשות
- **Retry Logic**: אפשרות ל-automatic retry עם exponential backoff
- **Load Balancing**: RabbitMQ מחלק עבודה באופן אוטומטי בין workers
- **Monitoring**: נראות טובה יותר על queue depth ו-processing rates

### 37. איך אתה מחליט מתי להגדיל workers לעומת generators?
**תשובה:**
**הגדלת Workers כאשר:**
- Queue depth גדל באופן קבוע (הודעות מצטברות)
- RabbitMQ metrics מראים על bottleneck ב-message consumption
- Latency גדל בין publish ל-processing start
- CPU utilization נמוך ברוב הזמן (I/O bound)

**הגדלת Generators כאשר:**
- Workers ממתינים הרבה זמן לתשובות HTTP
- Generator CPU/Memory utilization גבוה
- Gemini API rate limits מוגעות
- התשובות מהגנרטור איטיות אבל הqueue ריק

**מטריקות מפתח:**
```
Queue Depth vs Processing Rate
HTTP Response Time (Worker -> Generator)  
Generator Resource Utilization
AI API Rate Limit Usage
```

### 38. איך תעצב Kubernetes deployment למערכת?
**תשובה:**
```yaml
# Namespace separation
apiVersion: v1
kind: Namespace
metadata:
  name: solara-ai

---
# NestJS Service
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nestjs-service
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: nestjs
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi" 
            cpu: "500m"
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
        livenessProbe:
          httpGet:
            path: /health
            port: 3000

---
# Python Generator with HPA
apiVersion: apps/v1  
kind: Deployment
metadata:
  name: python-generator
spec:
  replicas: 2
  template:
    spec:
      containers:
      - name: generator
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "1000m"

---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: generator-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: python-generator
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70

---
# Python Worker with KEDA for queue-based scaling
apiVersion: apps/v1
kind: Deployment  
metadata:
  name: python-worker
spec:
  replicas: 1 # KEDA will manage this
  template:
    spec:
      containers:
      - name: worker
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"

---
apiVersion: keda.sh/v1alpha1
kind: ScaledObject
metadata:
  name: worker-scaledobject
spec:
  scaleTargetRef:
    name: python-worker
  minReplicaCount: 1
  maxReplicaCount: 20
  triggers:
  - type: rabbitmq
    metadata:
      queueName: campaign.generate
      queueLength: '5'
```

### 39. איך תממש circuit breaker pattern במערכת?
**תשובה:**
```python
# Python Worker עם Circuit Breaker
import asyncio
from enum import Enum
from datetime import datetime, timedelta

class CircuitState(Enum):
    CLOSED = "closed"      # Normal operation
    OPEN = "open"          # Failing, reject requests  
    HALF_OPEN = "half_open" # Testing if service recovered

class CircuitBreaker:
    def __init__(self, failure_threshold=5, timeout=60, expected_exception=Exception):
        self.failure_threshold = failure_threshold
        self.timeout = timedelta(seconds=timeout)
        self.expected_exception = expected_exception
        
        self.failure_count = 0
        self.last_failure_time = None
        self.state = CircuitState.CLOSED
        
    async def call(self, func, *args, **kwargs):
        if self.state == CircuitState.OPEN:
            if self._should_attempt_reset():
                self.state = CircuitState.HALF_OPEN
            else:
                raise Exception("Circuit breaker is OPEN")
                
        try:
            result = await func(*args, **kwargs)
            self._on_success()
            return result
        except self.expected_exception as e:
            self._on_failure()
            raise e
            
    def _on_success(self):
        self.failure_count = 0
        self.state = CircuitState.CLOSED
        
    def _on_failure(self):
        self.failure_count += 1
        self.last_failure_time = datetime.now()
        
        if self.failure_count >= self.failure_threshold:
            self.state = CircuitState.OPEN

# שימוש ב-Worker
class CampaignWorker:
    def __init__(self):
        self.generator_circuit = CircuitBreaker(
            failure_threshold=3, 
            timeout=30,
            expected_exception=httpx.HTTPError
        )
        
    async def process_campaign(self, campaign_data):
        try:
            result = await self.generator_circuit.call(
                self.call_generator_service, 
                campaign_data
            )
            return result
        except Exception as e:
            # Fallback: send error to result queue
            await self.publish_error_result(campaign_data['campaignId'], str(e))
```

### 40. איך תממש event sourcing למערכת campaigns?
**תשובה:**
```python
# Event Store Schema
from dataclasses import dataclass
from datetime import datetime
from typing import Dict, Any
import json

@dataclass
class DomainEvent:
    aggregate_id: str
    event_type: str
    event_data: Dict[str, Any]
    event_version: int
    timestamp: datetime
    
class CampaignEvents:
    CAMPAIGN_CREATED = "CampaignCreated"
    CAMPAIGN_QUEUED = "CampaignQueued" 
    GENERATION_STARTED = "GenerationStarted"
    TEXT_GENERATED = "TextGenerated"
    IMAGE_GENERATED = "ImageGenerated"
    CAMPAIGN_COMPLETED = "CampaignCompleted"
    CAMPAIGN_FAILED = "CampaignFailed"

# Event Store Implementation
class EventStore:
    def __init__(self, db_connection):
        self.db = db_connection
        
    async def append_events(self, aggregate_id: str, events: List[DomainEvent], 
                          expected_version: int = None):
        async with self.db.transaction():
            # Optimistic concurrency control
            current_version = await self.get_current_version(aggregate_id)
            if expected_version and current_version != expected_version:
                raise ConcurrencyException()
                
            for event in events:
                await self.db.execute("""
                    INSERT INTO event_store (aggregate_id, event_type, event_data, 
                                           event_version, timestamp)
                    VALUES ($1, $2, $3, $4, $5)
                """, aggregate_id, event.event_type, 
                    json.dumps(event.event_data), event.event_version, event.timestamp)
                    
    async def get_events(self, aggregate_id: str, from_version: int = 0):
        rows = await self.db.fetch("""
            SELECT * FROM event_store 
            WHERE aggregate_id = $1 AND event_version >= $2
            ORDER BY event_version
        """, aggregate_id, from_version)
        
        return [DomainEvent(**row) for row in rows]

# Campaign Aggregate
class Campaign:
    def __init__(self, campaign_id: str):
        self.id = campaign_id
        self.version = 0
        self.status = None
        self.user_id = None
        self.prompt = None
        self.generated_text = None
        self.image_path = None
        self.uncommitted_events = []
        
    def create_campaign(self, user_id: str, prompt: str):
        event = DomainEvent(
            aggregate_id=self.id,
            event_type=CampaignEvents.CAMPAIGN_CREATED,
            event_data={"user_id": user_id, "prompt": prompt},
            event_version=self.version + 1,
            timestamp=datetime.now()
        )
        self._apply_event(event)
        self.uncommitted_events.append(event)
        
    def queue_for_processing(self):
        event = DomainEvent(
            aggregate_id=self.id,
            event_type=CampaignEvents.CAMPAIGN_QUEUED,
            event_data={},
            event_version=self.version + 1,
            timestamp=datetime.now()
        )
        self._apply_event(event)
        self.uncommitted_events.append(event)
        
    def _apply_event(self, event: DomainEvent):
        if event.event_type == CampaignEvents.CAMPAIGN_CREATED:
            self.user_id = event.event_data["user_id"]
            self.prompt = event.event_data["prompt"]
            self.status = "PENDING"
        elif event.event_type == CampaignEvents.CAMPAIGN_QUEUED:
            self.status = "PROCESSING"
        # ... other event handlers
        
        self.version = event.event_version

# Projection for Read Model
class CampaignProjection:
    def __init__(self, db_connection):
        self.db = db_connection
        
    async def handle_event(self, event: DomainEvent):
        if event.event_type == CampaignEvents.CAMPAIGN_CREATED:
            await self.db.execute("""
                INSERT INTO campaign_read_model (id, user_id, prompt, status, created_at)
                VALUES ($1, $2, $3, $4, $5)
            """, event.aggregate_id, event.event_data["user_id"], 
                event.event_data["prompt"], "PENDING", event.timestamp)
```

### 41. איך תבנה distributed tracing למערכת microservices?
**תשובה:**
```javascript
// NestJS Service - OpenTelemetry Setup
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';

const sdk = new NodeSDK({
  traceExporter: new JaegerExporter({
    endpoint: process.env.JAEGER_ENDPOINT,
  }),
  instrumentations: [getNodeAutoInstrumentations()],
  serviceName: 'solara-nestjs-service',
});

// Campaign Service עם tracing
import { trace, context, SpanKind } from '@opentelemetry/api';

@Injectable()
export class CampaignService {
  private tracer = trace.getTracer('campaign-service');
  
  async create(createCampaignDto: CreateCampaignDto): Promise<Campaign> {
    return await this.tracer.startActiveSpan('campaign.create', async (span) => {
      span.setAttributes({
        'campaign.user_id': createCampaignDto.userId,
        'campaign.prompt_length': createCampaignDto.prompt.length,
      });
      
      try {
        const campaign = await this.campaignRepository.save(...);
        span.setStatus({ code: SpanStatusCode.OK });
        
        // Propagate trace context to RabbitMQ
        const traceContext = trace.setSpanContext(context.active(), span.spanContext());
        await this.rabbitMQService.publishCampaignGeneration({
          campaignId: campaign.id,
          prompt: campaign.prompt,
          traceContext: this.serializeContext(traceContext)
        });
        
        return campaign;
      } catch (error) {
        span.recordException(error);
        span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
        throw error;
      } finally {
        span.end();
      }
    });
  }
}
```

```python
# Python Worker עם OpenTelemetry
from opentelemetry import trace, context
from opentelemetry.exporter.jaeger.thrift import JaegerExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.instrumentation.requests import RequestsInstrumentor
from opentelemetry.instrumentation.asyncio import AsyncIOInstrumentor

# Initialize tracing
trace.set_tracer_provider(TracerProvider())
tracer_provider = trace.get_tracer_provider()

jaeger_exporter = JaegerExporter(
    agent_host_name="jaeger",
    agent_port=6831,
)

span_processor = BatchSpanProcessor(jaeger_exporter)
tracer_provider.add_span_processor(span_processor)

# Auto-instrument HTTP calls
RequestsInstrumentor().instrument()
AsyncIOInstrumentor().instrument()

class CampaignWorker:
    def __init__(self):
        self.tracer = trace.get_tracer("campaign-worker")
        
    async def process_message(self, message_data):
        # Extract trace context from message
        trace_context = self.deserialize_context(message_data.get('traceContext'))
        
        with trace.use_span(trace_context):
            with self.tracer.start_as_current_span(
                "campaign.process",
                kind=SpanKind.CONSUMER
            ) as span:
                span.set_attributes({
                    "campaign.id": message_data['campaignId'],
                    "messaging.system": "rabbitmq",
                    "messaging.destination": "campaign.generate"
                })
                
                try:
                    # Call generator with trace propagation
                    result = await self.call_generator(message_data)
                    span.set_status(Status(StatusCode.OK))
                    return result
                except Exception as e:
                    span.record_exception(e)
                    span.set_status(Status(StatusCode.ERROR, str(e)))
                    raise
```

### 42. איך תממש advanced caching strategy עם cache warming?
**תשובה:**
```python
# Multi-Layer Caching Strategy
from typing import Optional, Dict, Any, List
import hashlib
import json
import asyncio
from datetime import datetime, timedelta
import redis.asyncio as redis

class CacheLayer(Enum):
    MEMORY = "memory"      # In-process cache
    REDIS = "redis"        # Distributed cache  
    DATABASE = "database"  # Persistent storage

class CacheEntry:
    def __init__(self, data: Any, ttl: int, cache_key: str):
        self.data = data
        self.ttl = ttl
        self.created_at = datetime.now()
        self.cache_key = cache_key
        self.hit_count = 0
        
    def is_expired(self) -> bool:
        return datetime.now() > self.created_at + timedelta(seconds=self.ttl)

class AdvancedCacheManager:
    def __init__(self):
        self.memory_cache: Dict[str, CacheEntry] = {}
        self.redis_client = redis.Redis(host='redis', port=6379)
        self.cache_stats = {
            'hits': 0, 'misses': 0, 'evictions': 0
        }
        
    def generate_cache_key(self, prompt: str, model_config: dict) -> str:
        """Generate deterministic cache key from prompt and config"""
        content = {
            'prompt': prompt.strip().lower(),
            'model': model_config.get('model', ''),
            'temperature': model_config.get('temperature', 0.7),
            'max_tokens': model_config.get('max_tokens', 1500)
        }
        content_str = json.dumps(content, sort_keys=True)
        return f"ai_gen:{hashlib.sha256(content_str.encode()).hexdigest()[:16]}"
        
    async def get_cached_content(self, cache_key: str) -> Optional[Dict[str, Any]]:
        """Multi-layer cache retrieval with promotion"""
        
        # Layer 1: Memory cache (fastest)
        if cache_key in self.memory_cache:
            entry = self.memory_cache[cache_key]
            if not entry.is_expired():
                entry.hit_count += 1
                self.cache_stats['hits'] += 1
                return entry.data
            else:
                del self.memory_cache[cache_key]
                
        # Layer 2: Redis cache
        try:
            cached_data = await self.redis_client.get(cache_key)
            if cached_data:
                data = json.loads(cached_data)
                
                # Promote to memory cache for frequent access
                self.memory_cache[cache_key] = CacheEntry(
                    data=data, 
                    ttl=300,  # 5 minutes in memory
                    cache_key=cache_key
                )
                
                self.cache_stats['hits'] += 1
                return data
        except Exception as e:
            logger.error(f"Redis cache error: {e}")
            
        self.cache_stats['misses'] += 1
        return None
        
    async def set_cached_content(self, cache_key: str, data: Dict[str, Any], ttl: int = 3600):
        """Store in multiple cache layers"""
        
        # Memory cache (short TTL)
        self.memory_cache[cache_key] = CacheEntry(
            data=data,
            ttl=min(ttl, 300),  # Max 5 minutes in memory
            cache_key=cache_key
        )
        
        # Redis cache (longer TTL)
        try:
            await self.redis_client.setex(
                cache_key, 
                ttl, 
                json.dumps(data, default=str)
            )
        except Exception as e:
            logger.error(f"Failed to cache in Redis: {e}")
            
    async def warm_cache_for_popular_prompts(self):
        """Proactive cache warming based on usage patterns"""
        
        # Get popular prompt patterns from analytics
        popular_prompts = await self.get_popular_prompt_patterns()
        
        tasks = []
        for prompt_pattern in popular_prompts:
            task = self.pre_generate_content(prompt_pattern)
            tasks.append(task)
            
        # Execute warming in parallel with limited concurrency
        semaphore = asyncio.Semaphore(3)  # Max 3 concurrent generations
        
        async def bounded_generation(prompt_pattern):
            async with semaphore:
                await self.pre_generate_content(prompt_pattern)
                
        await asyncio.gather(*[bounded_generation(p) for p in popular_prompts])
        
    async def pre_generate_content(self, prompt_pattern: str):
        """Pre-generate and cache content for anticipated requests"""
        variations = self.generate_prompt_variations(prompt_pattern)
        
        for variation in variations:
            cache_key = self.generate_cache_key(variation, {'temperature': 0.7})
            
            # Skip if already cached
            if await self.get_cached_content(cache_key):
                continue
                
            try:
                # Generate content
                generated_content = await self.generator_service.generate_text(
                    variation, 
                    f"cache_warm_{int(datetime.now().timestamp())}"
                )
                
                await self.set_cached_content(
                    cache_key,
                    {
                        'generated_text': generated_content,
                        'cached_at': datetime.now().isoformat(),
                        'cache_type': 'pre_warmed'
                    },
                    ttl=7200  # 2 hours for pre-warmed content
                )
                
                logger.info(f"Pre-warmed cache for pattern: {prompt_pattern[:50]}...")
                
            except Exception as e:
                logger.error(f"Cache warming failed for {prompt_pattern}: {e}")

# Usage in Generator Service
class GeneratorService:
    def __init__(self):
        self.cache_manager = AdvancedCacheManager()
        
    async def generate_text_with_cache(self, prompt: str, campaign_id: str, 
                                     model_config: dict) -> str:
        
        cache_key = self.cache_manager.generate_cache_key(prompt, model_config)
        
        # Try cache first
        cached_result = await self.cache_manager.get_cached_content(cache_key)
        if cached_result:
            logger.info(f"[{campaign_id}] Cache hit for prompt")
            return cached_result['generated_text']
            
        # Generate new content
        logger.info(f"[{campaign_id}] Cache miss, generating new content")
        generated_text = await self.generate_text(prompt, campaign_id)
        
        # Cache the result
        await self.cache_manager.set_cached_content(
            cache_key,
            {
                'generated_text': generated_text,
                'campaign_id': campaign_id,
                'generated_at': datetime.now().isoformat()
            }
        )
        
        return generated_text
```

### 43. איך תבנה advanced monitoring עם custom metrics ו-SLI/SLO?
**תשובה:**
```python
# Custom Metrics Collection
from prometheus_client import Counter, Histogram, Gauge, start_http_server
import time
from functools import wraps

# Define custom metrics
CAMPAIGN_REQUESTS_TOTAL = Counter(
    'campaign_requests_total',
    'Total campaign requests',
    ['status', 'user_tier']
)

GENERATION_DURATION_SECONDS = Histogram(
    'ai_generation_duration_seconds',
    'Time spent generating AI content',
    ['content_type', 'model'],
    buckets=[0.5, 1.0, 2.5, 5.0, 10.0, 30.0, 60.0, 120.0]
)

QUEUE_DEPTH = Gauge(
    'rabbitmq_queue_depth',
    'Number of messages in queue',
    ['queue_name']
)

AI_API_RATE_LIMIT_REMAINING = Gauge(
    'gemini_api_rate_limit_remaining',
    'Remaining API calls in current window'
)

CONTENT_QUALITY_SCORE = Histogram(
    'generated_content_quality_score',
    'Quality score of generated content',
    ['content_type'],
    buckets=[0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
)

# SLI/SLO Implementation
class SLIRecorder:
    def __init__(self):
        self.sli_metrics = {
            'availability': Gauge('service_availability', 'Service availability SLI'),
            'latency_p99': Gauge('request_latency_p99', 'P99 latency SLI'),
            'error_rate': Gauge('error_rate_sli', 'Error rate SLI'),
            'quality_score': Gauge('content_quality_sli', 'Content quality SLI')
        }
        
        # SLO Targets
        self.slo_targets = {
            'availability': 0.999,    # 99.9% uptime
            'latency_p99': 30.0,      # P99 < 30 seconds
            'error_rate': 0.01,       # < 1% error rate
            'quality_score': 0.8      # > 80% quality score
        }
        
    def record_availability(self, is_healthy: bool):
        self.sli_metrics['availability'].set(1.0 if is_healthy else 0.0)
        
    def record_request_latency(self, duration_seconds: float):
        GENERATION_DURATION_SECONDS.observe(duration_seconds)
        
    def calculate_slo_burn_rate(self, metric_name: str, current_value: float) -> float:
        """Calculate error budget burn rate"""
        target = self.slo_targets[metric_name]
        
        if metric_name in ['availability', 'quality_score']:
            # Higher is better metrics
            error_rate = 1 - current_value
            target_error_rate = 1 - target
            if target_error_rate == 0:
                return float('inf') if error_rate > 0 else 0
            return error_rate / target_error_rate
        else:
            # Lower is better metrics
            if target == 0:
                return float('inf') if current_value > 0 else 0
            return current_value / target

# Advanced Decorator for Automatic Metrics
def monitor_performance(content_type: str = None, track_quality: bool = False):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            start_time = time.time()
            campaign_id = kwargs.get('campaign_id', 'unknown')
            
            try:
                result = await func(*args, **kwargs)
                
                # Record success metrics
                duration = time.time() - start_time
                GENERATION_DURATION_SECONDS.labels(
                    content_type=content_type or 'unknown',
                    model='gemini-2.0-flash'
                ).observe(duration)
                
                CAMPAIGN_REQUESTS_TOTAL.labels(
                    status='success',
                    user_tier='standard'  # Could be dynamic
                ).inc()
                
                # Track content quality if enabled
                if track_quality and hasattr(result, 'generated_text'):
                    quality_score = await calculate_content_quality(result.generated_text)
                    CONTENT_QUALITY_SCORE.labels(
                        content_type=content_type or 'text'
                    ).observe(quality_score)
                
                logger.info(f"[{campaign_id}] Performance metrics recorded: "
                          f"duration={duration:.2f}s, type={content_type}")
                
                return result
                
            except Exception as e:
                CAMPAIGN_REQUESTS_TOTAL.labels(
                    status='error',
                    user_tier='standard'
                ).inc()
                
                logger.error(f"[{campaign_id}] Request failed: {e}")
                raise
                
        return wrapper
    return decorator

# Usage in Generator Service
class GeneratorService:
    def __init__(self):
        self.sli_recorder = SLIRecorder()
        
    @monitor_performance(content_type='text', track_quality=True)
    async def generate_text(self, prompt: str, campaign_id: str) -> str:
        # Existing generation logic...
        return generated_text
        
    async def calculate_content_quality(self, text: str) -> float:
        """Calculate content quality score (0-1)"""
        score = 0.0
        
        # Length check
        if 50 <= len(text) <= 2000:
            score += 0.3
        
        # Coherence check (simplified)
        sentences = text.split('.')
        if len(sentences) >= 3:
            score += 0.2
            
        # Marketing keywords presence
        marketing_keywords = ['brand', 'product', 'customer', 'value', 'solution']
        keyword_count = sum(1 for keyword in marketing_keywords if keyword.lower() in text.lower())
        score += min(keyword_count / len(marketing_keywords), 0.3)
        
        # Grammar check (placeholder - would use real service)
        if len(text.split()) > 10:
            score += 0.2
            
        return min(score, 1.0)

# Alerting Rules (Prometheus AlertManager format)
alerting_rules = """
groups:
- name: solara-ai-slos
  rules:
  - alert: HighErrorRate
    expr: rate(campaign_requests_total{status="error"}[5m]) > 0.01
    for: 2m
    labels:
      severity: warning
    annotations:
      summary: "High error rate detected"
      description: "Error rate is {{ $value | humanizePercentage }} which exceeds SLO"
      
  - alert: HighLatency
    expr: histogram_quantile(0.99, rate(ai_generation_duration_seconds_bucket[5m])) > 30
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High P99 latency detected"
      description: "P99 latency is {{ $value }}s which exceeds SLO"
      
  - alert: QueueBacklog
    expr: rabbitmq_queue_depth > 100
    for: 1m
    labels:
      severity: critical
    annotations:
      summary: "Large queue backlog detected"
      description: "Queue depth is {{ $value }} messages"
"""
```

### 44. איך תממש blue-green deployment עם zero-downtime לmicroservices?
**תשובה:**
```yaml
# Blue-Green Kubernetes Deployment Strategy
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: solara-nestjs-service
spec:
  replicas: 5
  strategy:
    blueGreen:
      activeService: nestjs-active-service
      previewService: nestjs-preview-service
      autoPromotionEnabled: false
      scaleDownDelaySeconds: 30
      prePromotionAnalysis:
        templates:
        - templateName: success-rate
        args:
        - name: service-name
          value: nestjs-preview-service
      postPromotionAnalysis:
        templates:
        - templateName: success-rate
        args:
        - name: service-name
          value: nestjs-active-service
      previewReplicaCount: 1
      activeService: nestjs-active-service
      previewService: nestjs-preview-service
  selector:
    matchLabels:
      app: nestjs-service
  template:
    metadata:
      labels:
        app: nestjs-service
    spec:
      containers:
      - name: nestjs
        image: nestjs-service:latest
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
        livenessProbe:
          httpGet:
            path: /health  
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10

---
# Analysis Template for Success Rate
apiVersion: argoproj.io/v1alpha1
kind: AnalysisTemplate
metadata:
  name: success-rate
spec:
  args:
  - name: service-name
  metrics:
  - name: success-rate
    interval: 10s
    count: 5
    successCondition: result[0] >= 0.95
    provider:
      prometheus:
        address: http://prometheus:9090
        query: |
          sum(rate(
            http_requests_total{service="{{args.service-name}}",status=~"2.."}[2m]
          )) / 
          sum(rate(
            http_requests_total{service="{{args.service-name}}"}[2m]
          ))
```

```bash
# Blue-Green Deployment Script
#!/bin/bash
set -euo pipefail

NAMESPACE="solara-ai"
SERVICE_NAME="nestjs-service"
NEW_VERSION="${1:-latest}"
TIMEOUT="300s"

echo "Starting Blue-Green deployment for $SERVICE_NAME:$NEW_VERSION"

# 1. Update image in rollout
kubectl patch rollout $SERVICE_NAME -n $NAMESPACE \
  --type='merge' -p="{\"spec\":{\"template\":{\"spec\":{\"containers\":[{\"name\":\"nestjs\",\"image\":\"$SERVICE_NAME:$NEW_VERSION\"}]}}}}"

# 2. Wait for preview environment to be ready
echo "Waiting for preview environment..."
kubectl rollout status rollout/$SERVICE_NAME -n $NAMESPACE --timeout=$TIMEOUT

# 3. Run automated tests against preview
echo "Running automated tests against preview environment..."
PREVIEW_URL="http://nestjs-preview-service.$NAMESPACE.svc.cluster.local:3000"

# Health check
curl -f "$PREVIEW_URL/health" || { echo "Health check failed"; exit 1; }

# Integration tests
npm run test:integration -- --baseUrl=$PREVIEW_URL || { echo "Integration tests failed"; exit 1; }

# Load test (lightweight)
artillery run --target $PREVIEW_URL tests/load-test.yml || { echo "Load test failed"; exit 1; }

# 4. Manual approval step (in real scenario, this could be automated based on metrics)
echo "Preview environment is ready at: $PREVIEW_URL"
read -p "Deploy to production? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled. Rolling back..."
    kubectl argo rollouts abort $SERVICE_NAME -n $NAMESPACE
    exit 1
fi

# 5. Promote to active
echo "Promoting to active environment..."
kubectl argo rollouts promote $SERVICE_NAME -n $NAMESPACE

# 6. Wait for promotion to complete
kubectl rollout status rollout/$SERVICE_NAME -n $NAMESPACE --timeout=$TIMEOUT

echo "Blue-Green deployment completed successfully!"
```

### 45. איך תטפל במה שקורה אם הGemini API נתקע או נפל?
**תשובה:**
```python
# Advanced Fallback Strategy for AI Generation
from enum import Enum
from typing import List, Optional, Dict, Any
import asyncio
import aiohttp
from datetime import datetime, timedelta

class AIProvider(Enum):
    GEMINI = "gemini"
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    LOCAL_MODEL = "local"
    CACHED = "cached"

class AIProviderConfig:
    def __init__(self, provider: AIProvider, endpoint: str, api_key: str, 
                 priority: int, max_retries: int = 3):
        self.provider = provider
        self.endpoint = endpoint
        self.api_key = api_key
        self.priority = priority
        self.max_retries = max_retries
        self.failures = 0
        self.last_failure = None
        self.circuit_breaker_open = False

class FallbackAIManager:
    def __init__(self):
        self.providers = [
            AIProviderConfig(AIProvider.GEMINI, "https://generativelanguage.googleapis.com", 
                           os.getenv("GEMINI_API_KEY"), priority=1),
            AIProviderConfig(AIProvider.OPENAI, "https://api.openai.com", 
                           os.getenv("OPENAI_API_KEY"), priority=2),
            AIProviderConfig(AIProvider.ANTHROPIC, "https://api.anthropic.com", 
                           os.getenv("ANTHROPIC_API_KEY"), priority=3),
            AIProviderConfig(AIProvider.LOCAL_MODEL, "http://local-llm:8080", 
                           None, priority=4),
        ]
        self.cache_manager = AdvancedCacheManager()
        
    async def generate_text_with_fallback(self, prompt: str, campaign_id: str) -> Dict[str, Any]:
        """Generate text with automatic fallback to secondary providers"""
        
        # First try cache
        cache_key = self.cache_manager.generate_cache_key(prompt, {'temperature': 0.7})
        cached_result = await self.cache_manager.get_cached_content(cache_key)
        if cached_result:
            logger.info(f"[{campaign_id}] Using cached content")
            return {
                'text': cached_result['generated_text'],
                'provider': AIProvider.CACHED,
                'from_cache': True
            }
        
        # Try providers in priority order
        available_providers = [p for p in self.providers if not p.circuit_breaker_open]
        available_providers.sort(key=lambda x: x.priority)
        
        for provider in available_providers:
            try:
                logger.info(f"[{campaign_id}] Attempting generation with {provider.provider.value}")
                
                result = await self._generate_with_provider(provider, prompt, campaign_id)
                
                # Success - reset failure count
                provider.failures = 0
                provider.circuit_breaker_open = False
                
                # Cache successful result
                await self.cache_manager.set_cached_content(cache_key, {
                    'generated_text': result['text'],
                    'provider': provider.provider.value,
                    'generated_at': datetime.now().isoformat()
                })
                
                return result
                
            except Exception as e:
                logger.warning(f"[{campaign_id}] Provider {provider.provider.value} failed: {e}")
                await self._handle_provider_failure(provider, e)
                continue
        
        # All providers failed - use emergency fallback
        logger.error(f"[{campaign_id}] All AI providers failed, using emergency fallback")
        return await self._emergency_fallback(prompt, campaign_id)
    
    async def _generate_with_provider(self, provider: AIProviderConfig, 
                                    prompt: str, campaign_id: str) -> Dict[str, Any]:
        """Generate content with specific provider"""
        
        if provider.provider == AIProvider.GEMINI:
            return await self._generate_gemini(provider, prompt, campaign_id)
        elif provider.provider == AIProvider.OPENAI:
            return await self._generate_openai(provider, prompt, campaign_id)
        elif provider.provider == AIProvider.ANTHROPIC:
            return await self._generate_anthropic(provider, prompt, campaign_id)
        elif provider.provider == AIProvider.LOCAL_MODEL:
            return await self._generate_local(provider, prompt, campaign_id)
        else:
            raise NotImplementedError(f"Provider {provider.provider} not implemented")
    
    async def _generate_gemini(self, provider: AIProviderConfig, 
                             prompt: str, campaign_id: str) -> Dict[str, Any]:
        """Generate with Gemini API"""
        try:
            # Use existing Gemini logic
            response = await self.client.models.generate_content(
                model="gemini-2.0-flash",
                contents=create_marketing_prompt(prompt),
                config=types.GenerateContentConfig(
                    max_output_tokens=1500,
                    temperature=0.7,
                )
            )
            
            if not response.candidates or not response.candidates[0].content.parts:
                raise ValueError("Empty response from Gemini")
                
            generated_text = response.candidates[0].content.parts[0].text
            
            return {
                'text': generated_text.strip(),
                'provider': AIProvider.GEMINI,
                'from_cache': False
            }
            
        except Exception as e:
            logger.error(f"[{campaign_id}] Gemini generation failed: {e}")
            raise
    
    async def _generate_openai(self, provider: AIProviderConfig, 
                             prompt: str, campaign_id: str) -> Dict[str, Any]:
        """Generate with OpenAI API"""
        async with aiohttp.ClientSession() as session:
            headers = {
                "Authorization": f"Bearer {provider.api_key}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "model": "gpt-4",
                "messages": [
                    {"role": "system", "content": "You are a professional marketing content generator."},
                    {"role": "user", "content": create_marketing_prompt(prompt)}
                ],
                "max_tokens": 1500,
                "temperature": 0.7
            }
            
            async with session.post(f"{provider.endpoint}/v1/chat/completions", 
                                  headers=headers, json=payload) as response:
                if response.status != 200:
                    raise Exception(f"OpenAI API error: {response.status}")
                    
                data = await response.json()
                generated_text = data['choices'][0]['message']['content']
                
                return {
                    'text': generated_text.strip(),
                    'provider': AIProvider.OPENAI,
                    'from_cache': False
                }
    
    async def _emergency_fallback(self, prompt: str, campaign_id: str) -> Dict[str, Any]:
        """Emergency fallback when all AI providers fail"""
        
        # Try to find similar cached content
        similar_content = await self._find_similar_cached_content(prompt)
        if similar_content:
            logger.info(f"[{campaign_id}] Using similar cached content as fallback")
            return {
                'text': similar_content,
                'provider': AIProvider.CACHED,
                'from_cache': True,
                'fallback': True
            }
        
        # Generate template-based content
        template_content = self._generate_template_content(prompt)
        logger.info(f"[{campaign_id}] Using template-based fallback content")
        
        return {
            'text': template_content,
            'provider': AIProvider.LOCAL_MODEL,
            'from_cache': False,
            'fallback': True
        }
    
    def _generate_template_content(self, prompt: str) -> str:
        """Generate template-based marketing content as last resort"""
        
        templates = [
            "Discover the power of {product}! Our innovative solution helps you {benefit}. "
            "Join thousands of satisfied customers who have transformed their {area} with our expertise. "
            "Contact us today to learn how we can help you achieve your goals.",
            
            "Looking for {solution}? You've found the right place! Our {product} delivers exceptional "
            "results for {target_audience}. With proven track record and dedicated support, "
            "we're here to help you succeed.",
            
            "Transform your {business_area} with our cutting-edge {product}. "
            "Experience the difference that quality and innovation can make. "
            "Get started today and see results that matter."
        ]
        
        # Simple keyword extraction and template filling
        keywords = self._extract_keywords(prompt)
        selected_template = templates[hash(prompt) % len(templates)]
        
        # Fill template with extracted keywords or defaults
        filled_template = selected_template.format(
            product=keywords.get('product', 'solution'),
            benefit=keywords.get('benefit', 'achieve your goals'),
            area=keywords.get('area', 'business'),
            solution=keywords.get('solution', 'the perfect solution'),
            target_audience=keywords.get('audience', 'businesses like yours'),
            business_area=keywords.get('business_area', 'operations')
        )
        
        return filled_template
    
    async def _handle_provider_failure(self, provider: AIProviderConfig, error: Exception):
        """Handle provider failure and circuit breaker logic"""
        provider.failures += 1
        provider.last_failure = datetime.now()
        
        # Open circuit breaker after max failures
        if provider.failures >= provider.max_retries:
            provider.circuit_breaker_open = True
            logger.warning(f"Circuit breaker opened for {provider.provider.value}")
            
            # Schedule circuit breaker reset (exponential backoff)
            reset_delay = min(60 * (2 ** provider.failures), 3600)  # Max 1 hour
            asyncio.create_task(self._schedule_circuit_breaker_reset(provider, reset_delay))
    
    async def _schedule_circuit_breaker_reset(self, provider: AIProviderConfig, delay: int):
        """Reset circuit breaker after delay"""
        await asyncio.sleep(delay)
        provider.circuit_breaker_open = False
        provider.failures = max(0, provider.failures - 1)  # Gradual recovery
        logger.info(f"Circuit breaker reset for {provider.provider.value}")

# Usage in Generator Service
class GeneratorService:
    def __init__(self):
        self.fallback_manager = FallbackAIManager()
        
    async def generate_text(self, prompt: str, campaign_id: str) -> str:
        """Generate text with built-in fallback strategy"""
        try:
            result = await self.fallback_manager.generate_text_with_fallback(
                prompt, campaign_id
            )
            
            # Log provider used for monitoring
            logger.info(f"[{campaign_id}] Content generated with {result['provider'].value}")
            
            return result['text']
            
        except Exception as e:
            logger.error(f"[{campaign_id}] All generation methods failed: {e}")
            # Final fallback - return error message for user
            return "We're experiencing technical difficulties. Please try again later."
```

### 46. איך תבנה real-time dashboard לmicroservices health?
**תשובה:**
```typescript
// Real-time Dashboard with WebSocket Updates
// Frontend: React + WebSocket
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import io from 'socket.io-client';

interface ServiceHealth {
  serviceName: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  responseTime: number;
  errorRate: number;
  throughput: number;
  lastUpdated: string;
}

interface QueueMetrics {
  queueName: string;
  depth: number;
  consumeRate: number;
  publishRate: number;
  consumers: number;
}

const SolaraSystemDashboard: React.FC = () => {
  const [services, setServices] = useState<ServiceHealth[]>([]);
  const [queues, setQueues] = useState<QueueMetrics[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<any[]>([]);
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    // Connect to real-time metrics WebSocket
    const newSocket = io(process.env.REACT_APP_METRICS_WS_URL || 'ws://localhost:4000');
    
    newSocket.on('service-health', (data: ServiceHealth[]) => {
      setServices(data);
    });
    
    newSocket.on('queue-metrics', (data: QueueMetrics[]) => {
      setQueues(data);
    });
    
    newSocket.on('system-metrics', (data: any) => {
      setSystemMetrics(prev => [...prev.slice(-50), data]); // Keep last 50 points
    });

    setSocket(newSocket);
    
    return () => newSocket.close();
  }, []);

  const getServiceStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'degraded': return 'bg-yellow-500';
      case 'unhealthy': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Solara AI System Dashboard</h1>
      
      {/* Service Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {services.map(service => (
          <div key={service.serviceName} className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">{service.serviceName}</h3>
              <div className={`w-3 h-3 rounded-full ${getServiceStatusColor(service.status)}`}></div>
            </div>
            <div className="space-y-1 text-sm text-gray-600">
              <div>Uptime: {(service.uptime * 100).toFixed(2)}%</div>
              <div>Response: {service.responseTime}ms</div>
              <div>Error Rate: {(service.errorRate * 100).toFixed(2)}%</div>
              <div>Throughput: {service.throughput}/min</div>
            </div>
          </div>
        ))}
      </div>

      {/* Queue Metrics */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Queue Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {queues.map(queue => (
            <div key={queue.queueName} className="border p-4 rounded">
              <h3 className="font-medium mb-2">{queue.queueName}</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Depth: <span className="font-mono">{queue.depth}</span></div>
                <div>Consumers: <span className="font-mono">{queue.consumers}</span></div>
                <div>Publish Rate: <span className="font-mono">{queue.publishRate}/s</span></div>
                <div>Consume Rate: <span className="font-mono">{queue.consumeRate}/s</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Real-time Metrics Chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">System Performance</h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={systemMetrics}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="totalRequests" stroke="#8884d8" name="Requests/min" />
            <Line type="monotone" dataKey="avgResponseTime" stroke="#82ca9d" name="Avg Response (ms)" />
            <Line type="monotone" dataKey="errorRate" stroke="#ff7300" name="Error Rate %" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SolaraSystemDashboard;
```

```typescript
// Backend: WebSocket Server for Real-time Metrics
// Node.js + Socket.io + Prometheus Integration
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { register, collectDefaultMetrics } from 'prom-client';
import axios from 'axios';

class MetricsAggregator {
  private io: Server;
  private prometheusUrl: string;
  private refreshInterval: number = 5000; // 5 seconds

  constructor(io: Server, prometheusUrl: string = 'http://prometheus:9090') {
    this.io = io;
    this.prometheusUrl = prometheusUrl;
    this.startMetricsCollection();
  }

  private startMetricsCollection() {
    setInterval(async () => {
      try {
        const [serviceHealth, queueMetrics, systemMetrics] = await Promise.all([
          this.getServiceHealthMetrics(),
          this.getQueueMetrics(), 
          this.getSystemMetrics()
        ]);

        this.io.emit('service-health', serviceHealth);
        this.io.emit('queue-metrics', queueMetrics);
        this.io.emit('system-metrics', systemMetrics);

      } catch (error) {
        console.error('Error collecting metrics:', error);
      }
    }, this.refreshInterval);
  }

  private async getServiceHealthMetrics() {
    const services = ['nestjs-service', 'python-generator', 'python-worker'];
    const healthData = [];

    for (const service of services) {
      try {
        // Get uptime
        const uptimeQuery = `up{job="${service}"}`;
        const uptimeResult = await this.queryPrometheus(uptimeQuery);
        const uptime = uptimeResult?.[0]?.value?.[1] || '0';

        // Get response time (P95)
        const latencyQuery = `histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{service="${service}"}[5m]))`;
        const latencyResult = await this.queryPrometheus(latencyQuery);
        const responseTime = Math.round((parseFloat(latencyResult?.[0]?.value?.[1] || '0')) * 1000);

        // Get error rate
        const errorQuery = `rate(http_requests_total{service="${service}",status=~"5.."}[5m]) / rate(http_requests_total{service="${service}"}[5m])`;
        const errorResult = await this.queryPrometheus(errorQuery);
        const errorRate = parseFloat(errorResult?.[0]?.value?.[1] || '0');

        // Get throughput
        const throughputQuery = `rate(http_requests_total{service="${service}"}[1m]) * 60`;
        const throughputResult = await this.queryPrometheus(throughputQuery);
        const throughput = Math.round(parseFloat(throughputResult?.[0]?.value?.[1] || '0'));

        healthData.push({
          serviceName: service,
          status: this.determineServiceStatus(parseFloat(uptime), errorRate, responseTime),
          uptime: parseFloat(uptime),
          responseTime,
          errorRate,
          throughput,
          lastUpdated: new Date().toISOString()
        });

      } catch (error) {
        console.error(`Error getting metrics for ${service}:`, error);
        healthData.push({
          serviceName: service,
          status: 'unhealthy',
          uptime: 0,
          responseTime: 0,
          errorRate: 1,
          throughput: 0,
          lastUpdated: new Date().toISOString()
        });
      }
    }

    return healthData;
  }

  private async getQueueMetrics() {
    const queues = ['campaign.generate', 'campaign.result'];
    const queueData = [];

    for (const queue of queues) {
      try {
        // Queue depth
        const depthQuery = `rabbitmq_queue_messages{queue="${queue}"}`;
        const depthResult = await this.queryPrometheus(depthQuery);
        const depth = parseInt(depthResult?.[0]?.value?.[1] || '0');

        // Consumer count
        const consumerQuery = `rabbitmq_queue_consumers{queue="${queue}"}`;
        const consumerResult = await this.queryPrometheus(consumerQuery);
        const consumers = parseInt(consumerResult?.[0]?.value?.[1] || '0');

        // Publish rate
        const publishQuery = `rate(rabbitmq_queue_messages_published_total{queue="${queue}"}[1m])`;
        const publishResult = await this.queryPrometheus(publishQuery);
        const publishRate = parseFloat(publishResult?.[0]?.value?.[1] || '0');

        // Consume rate
        const consumeQuery = `rate(rabbitmq_queue_messages_delivered_total{queue="${queue}"}[1m])`;
        const consumeResult = await this.queryPrometheus(consumeQuery);
        const consumeRate = parseFloat(consumeResult?.[0]?.value?.[1] || '0');

        queueData.push({
          queueName: queue,
          depth,
          consumers,
          publishRate: Math.round(publishRate * 100) / 100,
          consumeRate: Math.round(consumeRate * 100) / 100
        });

      } catch (error) {
        console.error(`Error getting queue metrics for ${queue}:`, error);
      }
    }

    return queueData;
  }

  private async getSystemMetrics() {
    try {
      const totalRequestsQuery = `sum(rate(http_requests_total[1m])) * 60`;
      const avgResponseTimeQuery = `avg(rate(http_request_duration_seconds_sum[1m]) / rate(http_request_duration_seconds_count[1m])) * 1000`;
      const errorRateQuery = `sum(rate(http_requests_total{status=~"5.."}[1m])) / sum(rate(http_requests_total[1m])) * 100`;

      const [totalRequests, avgResponseTime, errorRate] = await Promise.all([
        this.queryPrometheus(totalRequestsQuery),
        this.queryPrometheus(avgResponseTimeQuery),
        this.queryPrometheus(errorRateQuery)
      ]);

      return {
        timestamp: new Date().toISOString(),
        totalRequests: Math.round(parseFloat(totalRequests?.[0]?.value?.[1] || '0')),
        avgResponseTime: Math.round(parseFloat(avgResponseTime?.[0]?.value?.[1] || '0')),
        errorRate: Math.round((parseFloat(errorRate?.[0]?.value?.[1] || '0')) * 100) / 100
      };

    } catch (error) {
      console.error('Error getting system metrics:', error);
      return {
        timestamp: new Date().toISOString(),
        totalRequests: 0,
        avgResponseTime: 0,
        errorRate: 0
      };
    }
  }

  private async queryPrometheus(query: string) {
    try {
      const response = await axios.get(`${this.prometheusUrl}/api/v1/query`, {
        params: { query },
        timeout: 5000
      });
      
      return response.data?.data?.result || [];
    } catch (error) {
      console.error(`Prometheus query failed: ${query}`, error);
      return [];
    }
  }

  private determineServiceStatus(uptime: number, errorRate: number, responseTime: number): 'healthy' | 'degraded' | 'unhealthy' {
    if (uptime < 0.95 || errorRate > 0.05) {
      return 'unhealthy';
    } else if (uptime < 0.99 || errorRate > 0.01 || responseTime > 5000) {
      return 'degraded';
    }
    return 'healthy';
  }
}

// Express server setup
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const metricsAggregator = new MetricsAggregator(io);

io.on('connection', (socket) => {
  console.log('Client connected to metrics dashboard');
  
  socket.on('disconnect', () => {
    console.log('Client disconnected from metrics dashboard');
  });
});

server.listen(4000, () => {
  console.log('Real-time metrics server running on port 4000');
});
```