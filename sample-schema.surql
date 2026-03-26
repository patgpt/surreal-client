DEFINE TABLE user SCHEMAFULL;

DEFINE FIELD name ON user TYPE string;
DEFINE FIELD email ON user TYPE string ASSERT string::is_email($value);
DEFINE FIELD createdAt ON user TYPE datetime DEFAULT time::now();
DEFINE FIELD profile ON user TYPE option<object>;
DEFINE FIELD profile.bio ON user TYPE option<string>;
DEFINE FIELD profile.tags ON user TYPE option<array<string>>;
DEFINE FIELD settings ON user TYPE option<object>;
DEFINE FIELD settings.theme ON user TYPE option<string>;

DEFINE TABLE post SCHEMAFULL;

DEFINE FIELD author ON post TYPE record<user>;
DEFINE FIELD title ON post TYPE string;
DEFINE FIELD body ON post TYPE string;
DEFINE FIELD status ON post TYPE "draft" | "published" | "archived";
DEFINE FIELD labels ON post TYPE array<string> DEFAULT [];
DEFINE FIELD metadata ON post TYPE option<object>;
DEFINE FIELD metadata.wordCount ON post TYPE option<int>;
DEFINE FIELD metadata.readingMinutes ON post TYPE option<number>;
DEFINE FIELD ratings ON post TYPE array<object> DEFAULT [];
DEFINE FIELD ratings[*].score ON post TYPE number DEFAULT 0;
DEFINE FIELD ratings[*].source ON post TYPE option<string>;
DEFINE FIELD publishedAt ON post TYPE option<datetime>;

DEFINE TABLE apiKey SCHEMALESS;

DEFINE FIELD owner ON apiKey TYPE record<user>;
DEFINE FIELD name ON apiKey TYPE string;
DEFINE FIELD scopes ON apiKey TYPE array<string> DEFAULT [];
DEFINE FIELD revoked ON apiKey TYPE bool DEFAULT false;

DEFINE TABLE auditLog SCHEMAFULL;

DEFINE FIELD actor ON auditLog TYPE option<record<user>>;
DEFINE FIELD entityTable ON auditLog TYPE string;
DEFINE FIELD entityId ON auditLog TYPE string;
DEFINE FIELD action ON auditLog TYPE "create" | "update" | "delete";
DEFINE FIELD payload ON auditLog TYPE option<object>;
DEFINE FIELD createdAt ON auditLog TYPE datetime DEFAULT time::now();
