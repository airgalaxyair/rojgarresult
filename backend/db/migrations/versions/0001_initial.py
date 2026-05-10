"""Initial schema — all tables

Revision ID: 0001_initial
Revises: 
Create Date: 2025-01-15

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = '0001_initial'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # departments
    op.create_table('departments',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('slug', sa.String(120), nullable=False),
        sa.Column('logo_url', sa.String(500), nullable=True),
        sa.Column('official_site', sa.String(500), nullable=True),
        sa.Column('scraper_enabled', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name'),
        sa.UniqueConstraint('slug'),
    )
    op.create_index('ix_departments_slug', 'departments', ['slug'])

    # categories
    op.create_table('categories',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('slug', sa.String(120), nullable=False),
        sa.Column('parent_id', sa.Integer(), nullable=True),
        sa.Column('icon', sa.String(50), nullable=True),
        sa.Column('color', sa.String(20), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['parent_id'], ['categories.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name'),
        sa.UniqueConstraint('slug'),
    )

    # states
    op.create_table('states',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('slug', sa.String(120), nullable=False),
        sa.Column('code', sa.String(5), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('code'),
        sa.UniqueConstraint('name'),
        sa.UniqueConstraint('slug'),
    )

    # qualifications
    op.create_table('qualifications',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('slug', sa.String(120), nullable=False),
        sa.Column('level', sa.Integer(), nullable=False, server_default='0'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name'),
        sa.UniqueConstraint('slug'),
    )

    # tags
    op.create_table('tags',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(80), nullable=False),
        sa.Column('slug', sa.String(100), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name'),
        sa.UniqueConstraint('slug'),
    )

    # source_sites
    op.create_table('source_sites',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(200), nullable=False),
        sa.Column('url', sa.String(500), nullable=False),
        sa.Column('department_id', sa.Integer(), nullable=True),
        sa.Column('scraper_module', sa.String(100), nullable=False),
        sa.Column('scraper_type', sa.String(30), nullable=False, server_default='static'),
        sa.Column('scrape_interval_minutes', sa.Integer(), nullable=False, server_default='240'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('is_official', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('last_scraped_at', sa.DateTime(), nullable=True),
        sa.Column('failure_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('content_hash', sa.String(64), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['department_id'], ['departments.id']),
        sa.PrimaryKeyConstraint('id'),
    )

    # posts
    op.create_table('posts',
        sa.Column('id', sa.BigInteger(), nullable=False),
        sa.Column('slug', sa.String(300), nullable=False),
        sa.Column('title', sa.String(500), nullable=False),
        sa.Column('title_hi', sa.String(500), nullable=True),
        sa.Column('post_type', sa.String(30), nullable=False),
        sa.Column('status', sa.String(30), nullable=False, server_default='draft'),
        sa.Column('source_type', sa.String(30), nullable=False, server_default='official'),
        sa.Column('source_url', sa.String(1000), nullable=True),
        sa.Column('source_site_id', sa.Integer(), nullable=True),
        sa.Column('department_id', sa.Integer(), nullable=True),
        sa.Column('category_id', sa.Integer(), nullable=True),
        sa.Column('total_vacancies', sa.Integer(), nullable=True),
        sa.Column('application_start', sa.DateTime(), nullable=True),
        sa.Column('application_end', sa.DateTime(), nullable=True),
        sa.Column('exam_date', sa.DateTime(), nullable=True),
        sa.Column('result_date', sa.DateTime(), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('description_hi', sa.Text(), nullable=True),
        sa.Column('important_dates', sa.JSON(), nullable=True),
        sa.Column('eligibility', sa.JSON(), nullable=True),
        sa.Column('salary_range', sa.JSON(), nullable=True),
        sa.Column('selection_process', sa.Text(), nullable=True),
        sa.Column('pdf_urls', sa.JSON(), nullable=True),
        sa.Column('featured_image_url', sa.String(1000), nullable=True),
        sa.Column('is_featured', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('is_pinned', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('is_trending', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('seo_title', sa.String(80), nullable=True),
        sa.Column('seo_description', sa.String(200), nullable=True),
        sa.Column('seo_keywords', sa.JSON(), nullable=True),
        sa.Column('schema_markup', sa.JSON(), nullable=True),
        sa.Column('view_count', sa.BigInteger(), nullable=False, server_default='0'),
        sa.Column('share_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('telegram_sent_at', sa.DateTime(), nullable=True),
        sa.Column('published_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['category_id'], ['categories.id']),
        sa.ForeignKeyConstraint(['department_id'], ['departments.id']),
        sa.ForeignKeyConstraint(['source_site_id'], ['source_sites.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_posts_slug', 'posts', ['slug'], unique=True)
    op.create_index('ix_posts_post_type', 'posts', ['post_type'])
    op.create_index('ix_posts_status', 'posts', ['status'])
    op.create_index('ix_posts_published_at', 'posts', ['published_at'])
    op.create_index('ix_posts_department_id', 'posts', ['department_id'])
    op.create_index('ix_posts_application_end', 'posts', ['application_end'])
    op.create_index('ix_posts_type_status_published', 'posts', ['post_type', 'status', 'published_at'])

    # scraper_logs
    op.create_table('scraper_logs',
        sa.Column('id', sa.BigInteger(), nullable=False),
        sa.Column('source_site_id', sa.Integer(), nullable=False),
        sa.Column('started_at', sa.DateTime(), nullable=False),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.Column('status', sa.String(30), nullable=False),
        sa.Column('posts_found', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('posts_new', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('posts_updated', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('log_text', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['source_site_id'], ['source_sites.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_scraper_logs_source_site_id', 'scraper_logs', ['source_site_id'])

    # scraper_raw_items
    op.create_table('scraper_raw_items',
        sa.Column('id', sa.BigInteger(), nullable=False),
        sa.Column('source_site_id', sa.Integer(), nullable=False),
        sa.Column('raw_hash', sa.String(64), nullable=False),
        sa.Column('raw_data', sa.JSON(), nullable=False),
        sa.Column('extracted_data', sa.JSON(), nullable=True),
        sa.Column('status', sa.String(30), nullable=False, server_default='pending'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['source_site_id'], ['source_sites.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('raw_hash'),
    )

    # telegram_logs
    op.create_table('telegram_logs',
        sa.Column('id', sa.BigInteger(), nullable=False),
        sa.Column('post_id', sa.BigInteger(), nullable=True),
        sa.Column('channel_id', sa.String(100), nullable=False),
        sa.Column('message_id', sa.BigInteger(), nullable=True),
        sa.Column('sent_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.Column('status', sa.String(30), nullable=False, server_default='sent'),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['post_id'], ['posts.id']),
        sa.PrimaryKeyConstraint('id'),
    )

    # admins
    op.create_table('admins',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('name', sa.String(200), nullable=False),
        sa.Column('hashed_password', sa.String(255), nullable=False),
        sa.Column('role', sa.String(30), nullable=False, server_default='editor'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('last_login', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email'),
    )

    # audit_logs
    op.create_table('audit_logs',
        sa.Column('id', sa.BigInteger(), nullable=False),
        sa.Column('admin_id', sa.Integer(), nullable=False),
        sa.Column('action', sa.String(100), nullable=False),
        sa.Column('entity_type', sa.String(50), nullable=False),
        sa.Column('entity_id', sa.String(50), nullable=True),
        sa.Column('details', sa.JSON(), nullable=True),
        sa.Column('ip_address', sa.String(50), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['admin_id'], ['admins.id']),
        sa.PrimaryKeyConstraint('id'),
    )

    # advertisements
    op.create_table('advertisements',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(200), nullable=False),
        sa.Column('ad_type', sa.String(30), nullable=False),
        sa.Column('placement', sa.String(50), nullable=False),
        sa.Column('html_code', sa.Text(), nullable=True),
        sa.Column('start_date', sa.DateTime(), nullable=True),
        sa.Column('end_date', sa.DateTime(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )


def downgrade() -> None:
    op.drop_table('advertisements')
    op.drop_table('audit_logs')
    op.drop_table('admins')
    op.drop_table('telegram_logs')
    op.drop_table('scraper_raw_items')
    op.drop_table('scraper_logs')
    op.drop_table('posts')
    op.drop_table('source_sites')
    op.drop_table('tags')
    op.drop_table('qualifications')
    op.drop_table('states')
    op.drop_table('categories')
    op.drop_table('departments')
