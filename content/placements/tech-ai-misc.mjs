/**
 * AI, Generative AI, DBMS/SQL, Networking/Security/Cloud and MS Office MCQs (original),
 * plus generated pseudocode questions whose answers are computed by running the same logic.
 * Rows: [question, code|null, correct, wrong1, wrong2, wrong3, explanation, topic]
 */
import { int, mcq, numMcq, pick } from './lib.mjs';

export const AI = [
  ['Machine learning is best described as:', null, 'Systems that learn patterns from data instead of following only hand-written rules', 'Robots that walk', 'A programming language', 'A type of database', 'ML models improve from data.', 'Basics'],
  ['Which type of learning uses labelled data?', null, 'Supervised learning', 'Unsupervised learning', 'Reinforcement learning', 'Transfer learning only', 'Each training example has a known answer (label).', 'Learning types'],
  ['Grouping customers by similar buying habits without labels is an example of:', null, 'Clustering (unsupervised learning)', 'Classification', 'Regression', 'Reinforcement learning', 'No labels are given, so it is unsupervised clustering.', 'Learning types'],
  ['Predicting house prices from size and location is a:', null, 'Regression problem', 'Classification problem', 'Clustering problem', 'Search problem', 'The output is a continuous number.', 'Learning types'],
  ['Deciding whether an email is spam or not is a:', null, 'Classification problem', 'Regression problem', 'Clustering problem', 'Sorting problem', 'The output is one of two classes.', 'Learning types'],
  ['In reinforcement learning, an agent learns by:', null, 'Receiving rewards or penalties for its actions', 'Reading labelled examples', 'Clustering data', 'Copying a teacher\'s code', 'Agents maximise cumulative reward.', 'Learning types'],
  ['Overfitting means a model:', null, 'Performs well on training data but poorly on new data', 'Performs poorly on training data', 'Is too simple', 'Has too little data to load', 'It memorises noise instead of the general pattern.', 'Model evaluation'],
  ['Which technique helps reduce overfitting?', null, 'Regularisation', 'Using fewer validation checks', 'Training longer without limits', 'Removing the test set', 'Regularisation penalises overly complex models.', 'Model evaluation'],
  ['Why is data split into training and test sets?', null, 'To check how the model performs on unseen data', 'To make training faster only', 'To double the data', 'Because models need two copies', 'The test set estimates real-world performance.', 'Model evaluation'],
  ['Precision is defined as:', null, 'True positives ÷ (true positives + false positives)', 'True positives ÷ (true positives + false negatives)', 'Correct predictions ÷ all predictions', 'False positives ÷ all negatives', 'Precision: of predicted positives, how many are right.', 'Model evaluation'],
  ['Recall is defined as:', null, 'True positives ÷ (true positives + false negatives)', 'True positives ÷ (true positives + false positives)', 'True negatives ÷ all predictions', 'False negatives ÷ all positives', 'Recall: of actual positives, how many were found.', 'Model evaluation'],
  ['A model gets 90 of 100 test examples right. Its accuracy is:', null, '90%', '10%', '0.09%', '100%', 'Accuracy = correct ÷ total.', 'Model evaluation'],
  ['Which algorithm predicts a class from the majority vote of the closest data points?', null, 'k-Nearest Neighbours', 'Linear regression', 'k-Means', 'Apriori', 'k-NN looks at the k nearest neighbours.', 'Algorithms'],
  ['k-Means is used for:', null, 'Clustering', 'Classification with labels', 'Regression', 'Sorting', 'k-Means groups data into k clusters.', 'Algorithms'],
  ['A decision tree splits data based on:', null, 'Feature values that best separate the classes', 'Random numbers only', 'Alphabetical order', 'The size of the file', 'Splits aim to make groups purer (e.g. by information gain).', 'Algorithms'],
  ['Random Forest is:', null, 'An ensemble of many decision trees', 'A single deep neural network', 'A clustering method', 'A type of database index', 'It averages many trees to improve accuracy.', 'Algorithms'],
  ['Logistic regression is mainly used for:', null, 'Binary classification', 'Predicting continuous values', 'Clustering', 'Image generation', 'It outputs a probability for a class.', 'Algorithms'],
  ['What is a neural network loosely inspired by?', null, 'The human brain', 'Spreadsheets', 'Compilers', 'Relational databases', 'Layers of connected artificial neurons.', 'Deep learning'],
  ['What does an activation function add to a neural network?', null, 'Non-linearity', 'More data', 'Storage', 'Labels', 'Without non-linear activations, stacked layers act like one linear layer.', 'Deep learning'],
  ['Which activation outputs max(0, x)?', null, 'ReLU', 'Sigmoid', 'Tanh', 'Softmax', 'ReLU keeps positives and zeroes negatives.', 'Deep learning'],
  ['Backpropagation is used to:', null, 'Compute gradients to update the network\'s weights', 'Collect more data', 'Deploy the model', 'Label the data', 'It propagates the error backwards to adjust weights.', 'Deep learning'],
  ['Which type of network is best known for image tasks?', null, 'Convolutional Neural Network (CNN)', 'Recurrent Neural Network only', 'Decision tree', 'k-Means', 'Convolutions capture local image patterns.', 'Deep learning'],
  ['Gradient descent tries to:', null, 'Minimise the loss function', 'Maximise the loss function', 'Increase the data size', 'Sort the features', 'It moves weights in the direction that reduces loss.', 'Deep learning'],
  ['The learning rate controls:', null, 'How big each weight update step is', 'How much data is used', 'How many layers there are', 'The number of classes', 'Too high can overshoot; too low trains slowly.', 'Deep learning'],
  ['An epoch is:', null, 'One full pass through the training data', 'One weight update', 'One layer of the network', 'One test example', 'Training usually runs several epochs.', 'Deep learning'],
  ['Natural Language Processing (NLP) deals with:', null, 'Understanding and generating human language', 'Processing images only', 'Network routing', 'Database indexing', 'Examples: translation, chatbots, sentiment analysis.', 'NLP'],
  ['Tokenisation in NLP means:', null, 'Splitting text into smaller units such as words or sub-words', 'Encrypting text', 'Translating text', 'Deleting stop words only', 'Tokens are the basic units a model processes.', 'NLP'],
  ['Sentiment analysis determines:', null, 'Whether text expresses a positive, negative or neutral opinion', 'The language of a text', 'The length of a text', 'The author of a text', 'It classifies opinion or emotion.', 'NLP'],
  ['Which library is widely used for classical machine learning in Python?', null, 'scikit-learn', 'React', 'Flask', 'Pandas only for plotting', 'scikit-learn provides standard ML algorithms.', 'Tools'],
  ['Which Python library is mainly used for data frames?', null, 'pandas', 'NumPy only', 'Matplotlib', 'Requests', 'pandas offers the DataFrame.', 'Tools'],
  ['Feature scaling (e.g. normalisation) is important because:', null, 'Features on very different scales can distort many algorithms', 'It adds labels', 'It removes all outliers', 'It makes data larger', 'Distance-based and gradient methods are sensitive to scale.', 'Data'],
  ['Handling missing values by replacing them with the column mean is called:', null, 'Imputation', 'Normalisation', 'Regularisation', 'Augmentation', 'Imputation fills in missing data.', 'Data'],
  ['Bias in an AI system often comes from:', null, 'Unrepresentative or skewed training data', 'Using Python', 'Fast hardware', 'Too many test cases', 'Models learn the patterns, including the biases, in their data.', 'Ethics'],
  ['Which is an example of AI in everyday life?', null, 'Recommendations on a video streaming app', 'A basic calculator', 'A light switch', 'A paper notebook', 'Recommendations come from learned user preferences.', 'Basics'],
  ['The Turing Test checks whether:', null, 'A machine\'s conversation is indistinguishable from a human\'s', 'A computer is fast enough', 'Code has no bugs', 'A network is secure', 'Proposed by Alan Turing in 1950.', 'Basics'],
  ['A confusion matrix shows:', null, 'Counts of true and false positives and negatives', 'The model\'s source code', 'Training time', 'The network\'s layers', 'It summarises classification results.', 'Model evaluation'],
  ['Cross-validation is used to:', null, 'Estimate model performance more reliably using several train/test splits', 'Increase training speed', 'Label data automatically', 'Remove features', 'k-fold cross-validation rotates the test fold.', 'Model evaluation'],
  ['Transfer learning means:', null, 'Reusing a model trained on one task as a starting point for another', 'Moving data between servers', 'Copying code between projects', 'Training from scratch every time', 'It saves data and compute.', 'Deep learning'],
  ['Dimensionality reduction technique PCA stands for:', null, 'Principal Component Analysis', 'Primary Cluster Algorithm', 'Predictive Classification Approach', 'Partial Correlation Average', 'PCA finds directions of maximum variance.', 'Algorithms'],
  ['Computer vision is the field that enables computers to:', null, 'Interpret images and video', 'Store files', 'Route network packets', 'Write SQL queries', 'Examples: face detection, object recognition.', 'Basics'],
];

export const GENAI = [
  ['Generative AI refers to models that:', null, 'Create new content such as text, images or code', 'Only classify data', 'Only store data', 'Only sort numbers', 'They generate new outputs resembling their training data.', 'Basics'],
  ['LLM stands for:', null, 'Large Language Model', 'Linear Learning Machine', 'Logical Language Module', 'Long Lasting Memory', 'LLMs are trained on large amounts of text.', 'Basics'],
  ['Most modern LLMs are based on which architecture?', null, 'Transformer', 'Decision tree', 'k-Means', 'Recurrent network only', 'The Transformer was introduced in 2017 ("Attention Is All You Need").', 'Architecture'],
  ['The key mechanism in a Transformer that relates every token to every other token is:', null, 'Self-attention', 'Convolution', 'Pooling', 'Backtracking', 'Self-attention weighs how much each token should attend to others.', 'Architecture'],
  ['An LLM generates text by repeatedly:', null, 'Predicting the next token', 'Searching a database of answers', 'Copying the most similar web page', 'Sorting words alphabetically', 'Generation is next-token prediction, one token at a time.', 'Architecture'],
  ['A "prompt" is:', null, 'The input text or instructions given to a generative model', 'The model\'s training data', 'A type of GPU', 'The model\'s output score', 'Prompts guide the model\'s response.', 'Prompting'],
  ['Prompt engineering means:', null, 'Designing inputs carefully to get better outputs from a model', 'Building GPUs', 'Training a model from scratch', 'Writing database schemas', 'Clear instructions, context and examples improve results.', 'Prompting'],
  ['Giving a model a few worked examples inside the prompt is called:', null, 'Few-shot prompting', 'Zero-shot prompting', 'Fine-tuning', 'Pre-training', 'Examples in the prompt show the desired pattern.', 'Prompting'],
  ['Asking a model to do a task with no examples is:', null, 'Zero-shot prompting', 'Few-shot prompting', 'Reinforcement learning', 'Transfer learning', 'Only the instruction is given.', 'Prompting'],
  ['"Hallucination" in an LLM means:', null, 'Producing confident but false or made-up information', 'Running out of memory', 'Refusing every question', 'Generating images instead of text', 'Outputs should be verified, especially facts.', 'Risks'],
  ['RAG (Retrieval-Augmented Generation) improves answers by:', null, 'Retrieving relevant documents and giving them to the model as context', 'Training a bigger model', 'Removing the prompt', 'Increasing randomness', 'Grounding answers in retrieved sources reduces hallucination.', 'Techniques'],
  ['Fine-tuning a model means:', null, 'Further training a pre-trained model on task-specific data', 'Writing a better prompt', 'Changing the GPU', 'Compressing the output', 'It adapts the model\'s weights to a task.', 'Techniques'],
  ['What is an embedding?', null, 'A numeric vector that represents the meaning of text or other data', 'A compressed zip file', 'A type of prompt', 'A database table', 'Similar meanings have nearby vectors.', 'Techniques'],
  ['Vector databases are mainly used to:', null, 'Store embeddings and find similar items quickly', 'Store images only', 'Run SQL joins faster', 'Host websites', 'They support similarity search, often for RAG.', 'Techniques'],
  ['The "temperature" setting in text generation controls:', null, 'How random or creative the output is', 'The GPU temperature', 'The length of the prompt', 'The training speed', 'Lower temperature gives more predictable output.', 'Parameters'],
  ['A "token" in an LLM is roughly:', null, 'A word or part of a word', 'A full paragraph', 'A password', 'A GPU core', 'Text is split into tokens before processing.', 'Basics'],
  ['The context window of an LLM is:', null, 'The maximum amount of text (tokens) it can consider at once', 'The screen size', 'The training dataset', 'The number of users', 'Inputs longer than the window must be shortened.', 'Basics'],
  ['Which model type is commonly used to generate images from text?', null, 'Diffusion models', 'Linear regression', 'Decision trees', 'k-Nearest Neighbours', 'Diffusion models turn noise into images step by step.', 'Image generation'],
  ['GAN stands for:', null, 'Generative Adversarial Network', 'General Attention Network', 'Graph Analysis Node', 'Gradient Approximation Net', 'A generator and a discriminator compete during training.', 'Image generation'],
  ['In a GAN, the discriminator\'s job is to:', null, 'Tell real data from generated data', 'Generate new images', 'Label the training data', 'Compress the model', 'The generator tries to fool the discriminator.', 'Image generation'],
  ['RLHF stands for:', null, 'Reinforcement Learning from Human Feedback', 'Random Layer Hidden Function', 'Recurrent Language Hybrid Format', 'Rapid Learning High Frequency', 'Human preferences are used to make outputs more helpful and safe.', 'Techniques'],
  ['Pre-training an LLM usually involves:', null, 'Learning from a very large general text corpus', 'Writing prompts by hand', 'Labelling every sentence manually', 'Training on a single document', 'It learns language patterns before any fine-tuning.', 'Techniques'],
  ['A system prompt is used to:', null, 'Set overall behaviour and rules for the model in a conversation', 'Store user passwords', 'Train the model', 'Speed up the GPU', 'It frames how the model should respond.', 'Prompting'],
  ['"Chain-of-thought" prompting encourages the model to:', null, 'Reason step by step before answering', 'Answer in one word', 'Ignore the question', 'Repeat the prompt', 'Step-by-step reasoning often improves complex answers.', 'Prompting'],
  ['Prompt injection is:', null, 'Hidden instructions in input that try to override a model\'s intended behaviour', 'A faster way to train', 'A type of embedding', 'A GPU driver bug', 'Applications must treat untrusted content as data, not instructions.', 'Risks'],
  ['Which is a responsible practice when using generative AI for coursework or work?', null, 'Checking facts and following the rules on disclosure', 'Submitting outputs without reading them', 'Sharing private data in prompts', 'Assuming outputs are always correct', 'Verify outputs and respect privacy and policies.', 'Risks'],
  ['Multimodal models can:', null, 'Work with more than one type of data, such as text and images', 'Only process numbers', 'Only run on phones', 'Only translate languages', 'They accept or produce several modalities.', 'Basics'],
  ['An AI "agent" typically:', null, 'Uses a model plus tools to take actions towards a goal', 'Is a human support worker', 'Is a type of database', 'Only answers yes or no', 'Agents call tools (search, code, APIs) in steps.', 'Techniques'],
  ['Quantisation of a model mainly:', null, 'Reduces its size and speeds it up by using lower-precision numbers', 'Adds more parameters', 'Improves data quality', 'Creates new training data', 'Fewer bits per weight means smaller, faster models.', 'Techniques'],
  ['Copyright and privacy concerns with generative AI arise mainly from:', null, 'The data used for training and the content the model outputs', 'The colour of the interface', 'The speed of the internet', 'The programming language used', 'Both training data and outputs raise legal questions.', 'Risks'],
  ['Which output is most likely to need human review before use?', null, 'A model\'s summary of legal or medical facts', 'A list of rhyming words', 'A suggested variable name', 'A greeting message', 'High-stakes facts must be verified.', 'Risks'],
  ['A "foundation model" is:', null, 'A large model trained on broad data that can be adapted to many tasks', 'The first version of any app', 'A database schema', 'A model with no parameters', 'Foundation models are adapted by prompting or fine-tuning.', 'Basics'],
  ['Top-p (nucleus) sampling chooses the next token from:', null, 'The smallest set of tokens whose total probability exceeds p', 'Only the single most likely token', 'All tokens equally', 'Tokens in alphabetical order', 'It limits choices to the most probable ones.', 'Parameters'],
  ['Positional encoding in Transformers provides:', null, 'Information about the order of tokens', 'Extra training data', 'Image colours', 'User identity', 'Self-attention alone does not know token order.', 'Architecture'],
  ['Which is a common way to evaluate a chatbot\'s answers at scale?', null, 'Test sets with expected answers plus human or model-based grading', 'Counting the words in each answer', 'Measuring GPU temperature', 'Checking the font size', 'Evaluation compares outputs with references or rubrics.', 'Techniques'],
];

export const DBMS = [
  ['DBMS stands for:', null, 'Database Management System', 'Data Backup Management Software', 'Digital Base Memory System', 'Database Machine Server', 'Software that stores and manages data.', 'Basics'],
  ['A primary key:', null, 'Uniquely identifies each row and cannot be NULL', 'Can repeat across rows', 'Is always a text column', 'Links to another table only', 'Primary keys are unique and not null.', 'Keys'],
  ['A foreign key:', null, 'Refers to the primary key of another table', 'Must be unique in its own table', 'Cannot be NULL ever', 'Is the same as an index', 'It enforces relationships between tables.', 'Keys'],
  ['Which statement can remove only selected rows using a WHERE clause?', null, 'DELETE', 'TRUNCATE', 'DROP', 'ALTER', 'DELETE supports WHERE; TRUNCATE always empties the whole table and DROP removes the table.', 'SQL'],
  ['Which clause filters groups after GROUP BY?', null, 'HAVING', 'WHERE', 'ORDER BY', 'LIMIT', 'WHERE filters rows before grouping; HAVING filters groups.', 'SQL'],
  ['Which join returns only rows with matching values in both tables?', null, 'INNER JOIN', 'LEFT JOIN', 'FULL OUTER JOIN', 'CROSS JOIN', 'INNER JOIN keeps matches only.', 'Joins'],
  ['A LEFT JOIN returns:', null, 'All rows from the left table and matching rows from the right', 'Only matching rows', 'All rows from the right table', 'Only unmatched rows', 'Unmatched right-side columns become NULL.', 'Joins'],
  ['Which SQL keyword removes duplicate rows from a result?', null, 'DISTINCT', 'UNIQUE', 'DIFFERENT', 'SINGLE', 'SELECT DISTINCT removes duplicates.', 'SQL'],
  ['Normalisation is done to:', null, 'Reduce data redundancy and update anomalies', 'Make queries slower', 'Add duplicate data', 'Encrypt the database', 'It organises tables to avoid repeated data.', 'Normalisation'],
  ['A table is in 1NF when:', null, 'Every column holds atomic (indivisible) values', 'It has no primary key', 'It has only one column', 'It has no foreign keys', '1NF forbids repeating groups and multi-valued cells.', 'Normalisation'],
  ['ACID properties of transactions are:', null, 'Atomicity, Consistency, Isolation, Durability', 'Accuracy, Clarity, Integrity, Design', 'Access, Control, Index, Data', 'Atomicity, Concurrency, Indexing, Durability', 'ACID guarantees reliable transactions.', 'Transactions'],
  ['"Atomicity" means a transaction:', null, 'Happens completely or not at all', 'Runs very fast', 'Uses one table only', 'Is visible to all users at once', 'Partial transactions are rolled back.', 'Transactions'],
  ['Which command saves the changes of a transaction permanently?', null, 'COMMIT', 'ROLLBACK', 'SAVE', 'GRANT', 'COMMIT makes changes permanent.', 'Transactions'],
  ['An index on a column mainly helps to:', null, 'Speed up searches on that column', 'Reduce the table size', 'Prevent all duplicates', 'Encrypt the data', 'Indexes make lookups faster at the cost of extra storage and slower writes.', 'Indexes'],
  ['Which SQL function counts rows?', null, 'COUNT()', 'SUM()', 'TOTAL()', 'NUMBER()', 'COUNT(*) counts rows.', 'SQL'],
  ['Which is a DDL command?', null, 'CREATE', 'SELECT', 'INSERT', 'UPDATE', 'DDL defines structure: CREATE, ALTER, DROP.', 'SQL'],
  ['Which is a DML command?', null, 'UPDATE', 'CREATE', 'DROP', 'ALTER', 'DML changes data: INSERT, UPDATE, DELETE.', 'SQL'],
  ['Table Emp has salaries 30, 50, 50, 70 (in thousands). What does SELECT COUNT(DISTINCT salary) FROM Emp return?', null, '3', '4', '2', '200', 'Distinct salaries are 30, 50 and 70.', 'SQL output'],
  ['Table Marks has values 40, 60, 80. What does SELECT AVG(score) FROM Marks return?', null, '60', '180', '80', '40', '(40 + 60 + 80)/3 = 60.', 'SQL output'],
  ['Table T has rows with dept values A, A, B, C, C, C. What does SELECT dept, COUNT(*) FROM T GROUP BY dept HAVING COUNT(*) > 1 return?', null, 'A 2 and C 3', 'A 2, B 1 and C 3', 'C 3 only', 'B 1 only', 'Only groups with more than one row remain.', 'SQL output'],
  ['Which query returns the second highest salary from Emp(salary)?', null, 'SELECT MAX(salary) FROM Emp WHERE salary < (SELECT MAX(salary) FROM Emp)', 'SELECT salary FROM Emp ORDER BY salary', 'SELECT MAX(salary) - 1 FROM Emp', 'SELECT MIN(salary) FROM Emp', 'The highest salary below the overall maximum is the second highest.', 'SQL'],
  ['A view in SQL is:', null, 'A virtual table based on a query', 'A backup of a table', 'An index', 'A user account', 'Views store a query, not the data itself (unless materialised).', 'SQL'],
  ['What does the LIKE \'A%\' condition match?', null, 'Values starting with A', 'Values ending with A', 'Values containing only A', 'Exactly the value "A%"', '% matches any sequence of characters.', 'SQL'],
  ['Which key can be chosen as the primary key from several unique candidates?', null, 'Candidate key', 'Foreign key', 'Composite index', 'Super index', 'Each candidate key could serve as the primary key.', 'Keys'],
  ['An ER diagram represents:', null, 'Entities, their attributes and relationships', 'Network routes', 'Program flow', 'CPU scheduling', 'Entity-Relationship diagrams model data.', 'Basics'],
  ['Which SQL statement adds a new column to an existing table?', null, 'ALTER TABLE … ADD', 'UPDATE TABLE … ADD', 'INSERT COLUMN', 'MODIFY TABLE … NEW', 'ALTER TABLE changes structure.', 'SQL'],
  ['A deadlock occurs when:', null, 'Two transactions wait for each other\'s locks forever', 'A query has a syntax error', 'The database is full', 'An index is missing', 'Each holds a lock the other needs.', 'Transactions'],
  ['NoSQL databases such as MongoDB typically store data as:', null, 'Documents (e.g. JSON-like)', 'Only fixed-schema tables', 'Spreadsheets', 'Binary trees on paper', 'Many NoSQL stores are document- or key-value-based.', 'Basics'],
  ['Which ordering does ORDER BY use by default?', null, 'Ascending', 'Descending', 'Random', 'Insertion order', 'ASC is the default.', 'SQL'],
  ['Which of these removes a table completely, including its structure?', null, 'DROP TABLE', 'DELETE FROM', 'TRUNCATE TABLE', 'CLEAR TABLE', 'DROP deletes the table definition and data.', 'SQL'],
];

export const NETSEC = [
  ['How many layers does the OSI model have?', null, '7', '5', '4', '6', 'Physical, Data Link, Network, Transport, Session, Presentation, Application.', 'Networking'],
  ['Which layer of the OSI model handles routing between networks?', null, 'Network layer', 'Transport layer', 'Data link layer', 'Session layer', 'IP addressing and routing are at layer 3.', 'Networking'],
  ['TCP differs from UDP because TCP is:', null, 'Connection-oriented and reliable', 'Faster with no acknowledgements', 'Used only for video', 'A physical layer protocol', 'TCP guarantees ordered delivery; UDP does not.', 'Networking'],
  ['What does DNS do?', null, 'Translates domain names into IP addresses', 'Encrypts web pages', 'Assigns MAC addresses', 'Stores emails', 'DNS resolves names like example.com to IPs.', 'Networking'],
  ['Which protocol automatically assigns IP addresses to devices on a network?', null, 'DHCP', 'DNS', 'FTP', 'SMTP', 'Dynamic Host Configuration Protocol.', 'Networking'],
  ['The default port for HTTPS is:', null, '443', '80', '21', '25', 'HTTP uses 80; HTTPS uses 443.', 'Networking'],
  ['An IPv4 address is how many bits long?', null, '32', '64', '128', '16', 'IPv6 addresses are 128 bits.', 'Networking'],
  ['Which device forwards packets between different networks?', null, 'Router', 'Hub', 'Repeater', 'Modem only', 'Routers connect networks.', 'Networking'],
  ['A MAC address identifies:', null, 'A network interface card', 'A website', 'A domain', 'An email account', 'MAC addresses are hardware addresses.', 'Networking'],
  ['Which protocol is used to send email?', null, 'SMTP', 'HTTP', 'FTP', 'SNMP', 'Simple Mail Transfer Protocol.', 'Networking'],
  ['Phishing is:', null, 'Tricking people into revealing information through fake messages or sites', 'A type of firewall', 'A backup method', 'A network cable', 'Phishing imitates trusted senders.', 'Security'],
  ['A firewall is used to:', null, 'Filter network traffic based on security rules', 'Speed up the internet', 'Store passwords', 'Cool the server', 'Firewalls allow or block traffic.', 'Security'],
  ['Which is an example of two-factor authentication?', null, 'A password plus a one-time code sent to your phone', 'Two passwords', 'A long password', 'A username and email', 'Two different factors: something you know and something you have.', 'Security'],
  ['Encryption converts data into:', null, 'A form that only authorised parties can read', 'A smaller file', 'A database table', 'Plain text', 'Encrypted data needs a key to read.', 'Security'],
  ['Malware that encrypts files and demands payment is called:', null, 'Ransomware', 'Adware', 'Spyware', 'Firmware', 'Ransomware holds data hostage.', 'Security'],
  ['A DDoS attack aims to:', null, 'Overwhelm a service with traffic so it becomes unavailable', 'Steal a password silently', 'Fix software bugs', 'Encrypt a hard drive', 'Distributed Denial of Service floods a target.', 'Security'],
  ['SQL injection happens when:', null, 'Untrusted input is inserted into a database query without proper handling', 'A database is backed up', 'Too many users log in', 'A table has no index', 'Parameterised queries prevent it.', 'Security'],
  ['HTTPS is more secure than HTTP because it:', null, 'Encrypts data in transit using TLS', 'Uses a faster port', 'Stores pages offline', 'Removes cookies', 'TLS protects data between browser and server.', 'Security'],
  ['Cloud computing means:', null, 'Using computing resources such as servers and storage over the internet on demand', 'Storing data on a pen drive', 'Weather prediction software', 'Using only local servers', 'Resources are rented as services.', 'Cloud'],
  ['IaaS, PaaS and SaaS are:', null, 'Cloud service models', 'Programming languages', 'Network cables', 'Database types', 'Infrastructure, Platform and Software as a Service.', 'Cloud'],
  ['Gmail is an example of:', null, 'SaaS', 'IaaS', 'PaaS', 'On-premise software', 'Users use the software directly over the internet.', 'Cloud'],
  ['Renting virtual machines from a provider such as AWS EC2 is an example of:', null, 'IaaS', 'SaaS', 'PaaS', 'FaaS only', 'You manage the OS; the provider runs the hardware.', 'Cloud'],
  ['Which is a benefit of cloud computing?', null, 'Scaling resources up or down as needed', 'No internet needed', 'Unlimited free storage', 'No security needed', 'Elastic scaling is a key benefit.', 'Cloud'],
  ['A public cloud is:', null, 'Shared infrastructure offered by a provider to many customers', 'A server in your own office only', 'A free Wi-Fi network', 'A government website', 'Examples include AWS, Azure and Google Cloud.', 'Cloud'],
  ['Serverless computing (e.g. AWS Lambda) means:', null, 'You run code without managing servers; the provider handles scaling', 'There are no servers anywhere', 'Code runs only on your laptop', 'Servers are shut down', 'Servers exist but are fully managed.', 'Cloud'],
  ['A VPN mainly provides:', null, 'An encrypted connection over a public network', 'Faster downloads', 'Free storage', 'Antivirus scanning', 'Virtual Private Network.', 'Security'],
  ['Which protocol transfers files between client and server?', null, 'FTP', 'SMTP', 'ARP', 'DHCP', 'File Transfer Protocol.', 'Networking'],
  ['Which network topology connects every device to a central hub or switch?', null, 'Star', 'Bus', 'Ring', 'Mesh', 'Star topology has a central device.', 'Networking'],
  ['What does a subnet mask do?', null, 'Separates the network part of an IP address from the host part', 'Hides the IP address', 'Encrypts traffic', 'Assigns domain names', 'It defines which bits identify the network.', 'Networking'],
  ['Which of these is a strong password practice?', null, 'Use a long, unique password for each account', 'Reuse one password everywhere', 'Use your birth date', 'Write it on your monitor', 'Unique long passwords limit the damage of leaks.', 'Security'],
];

export const MSOFFICE = [
  ['In MS Excel, which function adds a range of cells?', null, 'SUM', 'ADD', 'TOTAL', 'PLUS', '=SUM(A1:A10) adds the range.', 'Excel'],
  ['Which Excel function finds a value in the first column of a table and returns a value from another column?', null, 'VLOOKUP', 'HLOOKUP only for rows', 'COUNTIF', 'CONCAT', 'VLOOKUP searches vertically.', 'Excel'],
  ['In Excel, a cell reference like $A$1 is:', null, 'An absolute reference', 'A relative reference', 'A mixed reference', 'A named range', 'Dollar signs fix both column and row.', 'Excel'],
  ['Which Excel function counts cells that meet a condition?', null, 'COUNTIF', 'COUNT', 'SUMIF', 'IF', 'COUNTIF(range, criteria).', 'Excel'],
  ['What does =IF(A1>50, "Pass", "Fail") return when A1 is 40?', null, 'Fail', 'Pass', '40', 'Error', 'The condition is false, so the third argument is returned.', 'Excel'],
  ['What does =AVERAGE(10, 20, 30) return?', null, '20', '60', '30', '10', '(10 + 20 + 30)/3 = 20.', 'Excel'],
  ['Which Excel feature summarises large data by dragging fields into rows and columns?', null, 'Pivot Table', 'Mail Merge', 'Slide Master', 'Track Changes', 'Pivot Tables summarise data.', 'Excel'],
  ['In Excel, what is the intersection of a row and a column called?', null, 'A cell', 'A sheet', 'A workbook', 'A range', 'Cells hold values and formulas.', 'Excel'],
  ['Which keyboard shortcut copies selected content in MS Office on Windows?', null, 'Ctrl + C', 'Ctrl + V', 'Ctrl + X', 'Ctrl + P', 'Ctrl + V pastes; Ctrl + X cuts.', 'General'],
  ['Which shortcut undoes the last action?', null, 'Ctrl + Z', 'Ctrl + Y', 'Ctrl + U', 'Ctrl + A', 'Ctrl + Y redoes.', 'General'],
  ['In MS Word, which feature creates personalised letters for many recipients from a list?', null, 'Mail Merge', 'Track Changes', 'Page Break', 'Format Painter', 'Mail Merge combines a document with a data source.', 'Word'],
  ['In MS Word, Track Changes is used to:', null, 'Record edits so they can be reviewed and accepted or rejected', 'Count words', 'Insert tables', 'Change the page colour', 'Useful for collaborative editing.', 'Word'],
  ['Which Word feature copies formatting from one piece of text to another?', null, 'Format Painter', 'Mail Merge', 'Thesaurus', 'Header', 'Format Painter copies styles.', 'Word'],
  ['The default file extension of a modern Word document is:', null, '.docx', '.doc only', '.txt', '.wrd', '.docx since Office 2007.', 'Word'],
  ['In PowerPoint, Slide Master is used to:', null, 'Apply consistent design and layout to all slides', 'Add animations to one slide', 'Record audio', 'Check spelling', 'Changes to the master update all slides.', 'PowerPoint'],
  ['Which PowerPoint view shows thumbnails of all slides for rearranging?', null, 'Slide Sorter', 'Notes Page', 'Reading View', 'Outline only', 'Slide Sorter makes reordering easy.', 'PowerPoint'],
  ['Which key starts a PowerPoint slideshow from the beginning?', null, 'F5', 'F2', 'F7', 'F12', 'Shift + F5 starts from the current slide.', 'PowerPoint'],
  ['Which character is typed first to start a formula in Excel?', null, '=', '#', '$', '%', 'Formulas start with an equals sign.', 'Excel'],
  ['What does the Excel error #DIV/0! mean?', null, 'A formula is dividing by zero', 'The column is too narrow', 'A name is not recognised', 'A reference is invalid', 'Division by zero or an empty cell.', 'Excel'],
  ['Which Excel function joins text from several cells?', null, 'CONCAT (or CONCATENATE)', 'JOINROW', 'MERGE', 'LINK', 'CONCAT joins strings.', 'Excel'],
];

// ---------- Pseudocode (generated; answers computed by running the same logic) ----------
const pc = (r) =>
  pick(r, [
    () => {
      const n = int(r, 4, 9), step = int(r, 1, 3);
      let s = 0;
      for (let i = 1; i <= n; i += step) s += i;
      return numMcq(r, { q: 'What will be the output of the following pseudocode?', ans: s, code: `Integer s = 0\nfor (each i from 1 to ${n} with step ${step})\n    s = s + i\nend for\nPrint s`, ex: `Adds i = ${Array.from({ length: Math.ceil(n / step) }, (_, k) => 1 + k * step).filter((v) => v <= n).join(', ')}: total ${s}.` });
    },
    () => {
      let a = int(r, 2, 9), b = int(r, 10, 30);
      const a0 = a, b0 = b;
      while (b !== 0) { const t = b; b = a % b; a = t; }
      return numMcq(r, { q: 'What will be the output of the following pseudocode?', ans: a, code: `Integer a = ${a0}, b = ${b0}, t\nwhile (b != 0)\n    t = b\n    b = a mod b\n    a = t\nend while\nPrint a`, ex: `This is Euclid's algorithm: it prints GCD(${a0}, ${b0}) = ${a}.` });
    },
    () => {
      const n = int(r, 3, 7);
      let f = 1;
      for (let i = 2; i <= n; i++) f *= i;
      return numMcq(r, { q: 'What will be the output of the following pseudocode?', ans: f, code: `Integer f = 1\nfor (each i from 2 to ${n})\n    f = f * i\nend for\nPrint f`, ex: `It computes ${n}! = ${f}.` });
    },
    () => {
      const x = int(r, 10, 40), y = int(r, 2, 6);
      let cnt = 0, v = x;
      while (v > 0) { v -= y; cnt++; }
      return numMcq(r, { q: 'What will be the output of the following pseudocode?', ans: cnt, code: `Integer v = ${x}, count = 0\nwhile (v > 0)\n    v = v - ${y}\n    count = count + 1\nend while\nPrint count`, ex: `Subtracting ${y} from ${x} until it is not positive takes ${cnt} steps.` });
    },
    () => {
      const n = int(r, 100, 9999);
      let s = 0, m = n;
      while (m > 0) { s += m % 10; m = Math.floor(m / 10); }
      return numMcq(r, { q: 'What will be the output of the following pseudocode?', ans: s, code: `Integer n = ${n}, s = 0\nwhile (n > 0)\n    s = s + (n mod 10)\n    n = n / 10   // integer division\nend while\nPrint s`, ex: `It adds the digits of ${n}: ${String(n).split('').join(' + ')} = ${s}.` });
    },
    () => {
      const a = int(r, 1, 9), b = int(r, 1, 9), c = int(r, 1, 9);
      const out = a > b ? (a > c ? a : c) : b > c ? b : c;
      return numMcq(r, { q: 'What will be the output of the following pseudocode?', ans: out, code: `Integer a = ${a}, b = ${b}, c = ${c}\nif (a > b)\n    if (a > c) Print a else Print c\nelse\n    if (b > c) Print b else Print c\nend if`, ex: `It prints the largest of ${a}, ${b}, ${c}: ${out}.` });
    },
    () => {
      const n = int(r, 5, 9);
      let x = 0, y = 1;
      for (let i = 0; i < n; i++) { const t = x + y; x = y; y = t; }
      return numMcq(r, { q: 'What will be the output of the following pseudocode?', ans: x, code: `Integer x = 0, y = 1, t\nrepeat ${n} times\n    t = x + y\n    x = y\n    y = t\nend repeat\nPrint x`, ex: `x steps through the Fibonacci numbers; after ${n} steps x = ${x}.` });
    },
    () => {
      const p = int(r, 2, 4), k = int(r, 2, 5);
      let res = 1;
      for (let i = 0; i < k; i++) res *= p;
      return numMcq(r, { q: 'What will be the output of the following pseudocode?', ans: res, code: `Integer r = 1\nfor (each i from 1 to ${k})\n    r = r * ${p}\nend for\nPrint r`, ex: `${p} multiplied ${k} times = ${p}^${k} = ${res}.` });
    },
    () => {
      const arr = Array.from({ length: 5 }, () => int(r, 1, 20));
      const t = int(r, 5, 15);
      const cnt = arr.filter((v) => v > t).length;
      if (cnt === 0) return pc(r);
      return numMcq(r, { q: 'What will be the output of the following pseudocode?', ans: cnt, code: `Integer arr[5] = {${arr.join(', ')}}\nInteger c = 0\nfor (each i from 0 to 4)\n    if (arr[i] > ${t}) c = c + 1\nend for\nPrint c`, ex: `Values greater than ${t}: ${arr.filter((v) => v > t).join(', ')} → ${cnt}.` });
    },
    () => {
      const a = int(r, 5, 15), b = int(r, 2, 4);
      const v = (a & b) + (a | b);
      return mcq(r, { q: 'What will be the output of the following pseudocode? (& is bitwise AND, | is bitwise OR)', code: `Integer a = ${a}, b = ${b}\nPrint (a & b) + (a | b)`, correct: String(v), wrong: [String(a + b + 1), String(a & b), String(a | b), String(v + 2), String(a * b)], ex: `a & b = ${a & b}, a | b = ${a | b}; sum ${v} (which always equals a + b).` });
    },
  ])();

export const pseudocode = pc;
