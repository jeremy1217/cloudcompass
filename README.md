# Multi-Cloud Strategy Assistant

A comprehensive solution for optimizing workload distribution across multiple cloud providers (AWS, Azure, GCP), helping organizations reduce costs and improve performance through intelligent cloud resource management.

## Features

### Data Collection & Analysis
- **Cloud Resource Profiling**: Connect to existing cloud accounts (AWS, Azure, GCP) to collect detailed workload information
- **Workload Classification**: Automatically categorize workloads based on their requirements and characteristics
- **Performance Metrics**: Collect and analyze performance data across cloud providers

### Intelligence Layer
- **Cross-Cloud Pricing Analysis**: Compare costs across cloud providers with up-to-date pricing models
- **Performance Benchmarking**: Understand how similar workloads perform on different infrastructures
- **Recommendation Engine**: Generate optimized distribution recommendations based on multiple factors

### Implementation & Monitoring
- **Migration Planning**: Step-by-step migration plans with risk assessments
- **Continuous Optimization**: Ongoing monitoring and optimization recommendations as cloud pricing and services evolve
- **Integration with CloudCostIQ**: Extend cost intelligence into strategic multi-cloud decision-making

## Architecture

The Multi-Cloud Strategy Assistant is built with a modular architecture:

- **Backend**: Node.js with Express
- **Database**: MongoDB
- **Frontend**: React.js with Tailwind CSS

## Prerequisites

- Node.js (v14+)
- MongoDB
- AWS, Azure, and/or GCP accounts with appropriate API access
- Docker and Docker Compose (for containerized deployment)

## Installation

### Option 1: Local Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/multicloud-strategy-assistant.git
   cd multicloud-strategy-assistant
   ```

2. Install dependencies for both server and client:
   ```
   npm install
   cd client
   npm install
   cd ..
   ```

3. Create a `.env` file in the root directory using the provided `.env.template`:
   ```
   cp .env.template .env
   ```

4. Configure the `.env` file with your cloud provider credentials and other settings.

5. Start the development server:
   ```
   npm run dev
   ```

### Option 2: Docker Deployment

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/multicloud-strategy-assistant.git
   cd multicloud-strategy-assistant
   ```

2. Create a `.env` file in the root directory using the provided `.env.template`.

3. Build and start the containers:
   ```
   docker-compose up --build
   ```

## Configuration

### Cloud Provider Setup

#### AWS
1. Create an IAM user with appropriate permissions:
   - EC2 read access
   - CloudWatch read access
   - Cost Explorer access
   - S3 read access
   - RDS read access
2. Generate API credentials and add them to your `.env` file.

#### Azure
1. Create an Azure Service Principal:
   ```
   az ad sp create-for-rbac --name "MultiCloudAssistant" --role "Reader" --scope "/subscriptions/YOUR_SUBSCRIPTION_ID"
   ```
2. Add the returned credentials to your `.env` file.

#### GCP
1. Create a service account with appropriate roles:
   - Compute Viewer
   - Monitoring Viewer
   - Billing Account Viewer
2. Download the JSON key file and reference it in your `.env` file.

### CloudCostIQ Integration (Optional)
1. Sign up for CloudCostIQ
2. Generate an API key
3. Add your API key and organization ID to the `.env` file

## Usage

### Web Interface

Access the web interface at `http://localhost:5000` (or the configured port).

1. **Dashboard**: Get an overview of your multi-cloud environment
2. **Resources**: View all cloud resources across providers
3. **Workload Analysis**: See workload classifications and characteristics
4. **Recommendations**: View cost-saving and optimization recommendations
5. **Migration Planning**: Create and manage migration plans
6. **Monitoring**: Monitor performance and costs across providers

### API Access

The system provides a comprehensive REST API:

```
# Authentication
POST /api/auth/login                # Log in and get JWT token

# Resources
GET /api/resources                  # Get all resources
GET /api/resources/:resourceId      # Get specific resource details

# Recommendations
GET /api/recommendations            # Get all recommendations
GET /api/recommendations/strategy   # Get overall strategy

# Migrations
POST /api/migrations/plan           # Generate migration plan
GET /api/migrations/plans           # Get all migration plans

# Monitoring
GET /api/monitoring/costs           # Get cost metrics
GET /api/monitoring/performance     # Get performance metrics
GET /api/monitoring/alerts          # Get active alerts
```

## Development

### Project Structure

```
multicloud-strategy-assistant/
├── src/                        # Server-side code
│   ├── data-collection/        # Cloud provider data collection
│   ├── intelligence/           # Analysis and recommendation engine
│   ├── implementation/         # Migration planning and monitoring
│   ├── integration/            # CloudCostIQ integration
│   ├── database/               # Database interface
│   ├── models/                 # Mongoose models
│   ├── routes/                 # API routes
│   ├── middleware/             # Express middleware
│   └── utils/                  # Utility functions
├── client/                     # Client-side React application
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── pages/              # Page components
│   │   ├── context/            # React context
│   │   ├── hooks/              # Custom hooks
│   │   └── utils/              # Utility functions
├── tests/                      # Test files
├── Dockerfile                  # Docker configuration
├── docker-compose.yml          # Docker Compose configuration
└── .env.template               # Environment variables template
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [AWS SDK for JavaScript](https://aws.amazon.com/sdk-for-javascript/)
- [Azure SDK for JavaScript](https://github.com/Azure/azure-sdk-for-js)
- [Google Cloud Node.js Client](https://github.com/googleapis/google-cloud-node)
- [Express](https://expressjs.com/)
- [Mongoose](https://mongoosejs.com/)
- [React](https://reactjs.org/)
- [Recharts](https://recharts.org/)
- [Tailwind CSS](https://tailwindcss.com/)