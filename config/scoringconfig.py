# config.py

# Airtable configuration settings
AIRTABLE_API_KEY = 'your_airtable_api_key'
AIRTABLE_BASE_ID = 'your_airtable_base_id'
AIRTABLE_TABLE_NAME = 'INSERT TABLE NAME'  # Example table name

# GPT and Claude model configuration
GPT_MODEL = 'gpt-4o'            # Using GPT-4 for high-quality responses
CLAUDE_MODEL = 'claude-2'      # Claude model for comparison
MAX_TOKENS = 200               # Token limit per response
TEMPERATURE = 0.7              # Temperature for response generation (0.7 for creativity)

# Scoring Weights
SCORING_WEIGHTS = {
    "relevance": 1.0,          # Relevance is essential, weighted at 1.0
    "completeness": 0.8,       # Completeness has slightly less weight
    "clarity": 0.6,            # Clarity is important but weighted less
    "best_practices": 0.5,     # Best practices alignment has a moderate weight
    "specificity": 0.7         # Specificity carries importance in detailed responses
}

# Scoring scale configuration
SCORING_SCALE = {
    "min_score": 1,            # Minimum score for any criterion
    "max_score": 5,            # Maximum score, allowing fractional scoring if needed
}

# Thresholds
OPTIMAL_SCORE_THRESHOLD = 4.5  # Minimum average score to qualify as optimal
LOW_SCORE_THRESHOLD = 2.0      # Any score below 2 is flagged for review

# Paths and file settings
CSV_PATH = 'data/output_scores.csv'  # Output path for CSV score data
EXCEL_PATH = 'data/output_scores.xlsx'  # Output path for Excel score data

# Logging and debugging settings
LOGGING_LEVEL = 'DEBUG'               # Set logging level (e.g., DEBUG, INFO, WARNING, ERROR)
LOG_FILE_PATH = 'logs/app.log'        # Log file path for debugging

# AI Persona Settings
AI_PERSONA = {
    "name": "Scoring bot",
    "background": "Goodwilled AI designed to score responses based off context",
    "tone": "exact",
    "purpose": "Provide unbiased and consistent scoring for responses based off criteria",
}

# Environment-specific settings (development, testing, production)
ENV = 'development'                   # Options: 'development', 'testing', 'production'
DEBUG_MODE = True                     # Toggle debugging

# API retry settings
API_RETRY_ATTEMPTS = 3                # Number of retries if an API request fails
API_RETRY_DELAY = 5                   # Delay between retries in seconds

# Placeholder values for tools not currently active but might be used
NOTION_API_KEY = 'your_notion_api_key'
COPILOT_ENABLED = True                # Enables GitHub Copilot or similar code-assist tools

# Example scoring criteria definitions
SCORING_CRITERIA = {
    "relevance": "Does the response address the core question?",
    "completeness": "Does the response include all necessary details?",
    "clarity": "Is the response clear and easily understandable?",
    "best_practices": "Does the response align with industry best practices?",
    "specificity": "Is the response detailed and specific to the context?"
}