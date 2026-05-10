from telegram import Bot
from telegram.constants import ParseMode
from core.config import settings
from models.models import Post, PostType

POST_EMOJIS = {
    PostType.job: "💼",
    PostType.result: "📊",
    PostType.admit_card: "🎫",
    PostType.answer_key: "🔑",
    PostType.syllabus: "📚",
    PostType.admission: "🎓",
}

BASE_URL = "https://sarkarischool.in"


def _post_url(post: Post) -> str:
    prefix_map = {
        PostType.job: "jobs",
        PostType.result: "results",
        PostType.admit_card: "admit-card",
        PostType.answer_key: "answer-key",
        PostType.syllabus: "syllabus",
        PostType.admission: "admission",
    }
    prefix = prefix_map.get(post.post_type, "jobs")
    return f"{BASE_URL}/{prefix}/{post.slug}"


def _format_caption(post: Post) -> str:
    emoji = POST_EMOJIS.get(post.post_type, "🔔")
    lines = [f"{emoji} *{post.title}*", ""]

    if post.total_vacancies:
        lines.append(f"📋 *Posts:* {post.total_vacancies:,}")

    if post.application_start:
        lines.append(f"📅 *Apply From:* {post.application_start.strftime('%d %b %Y')}")

    if post.application_end:
        lines.append(f"⏰ *Last Date:* {post.application_end.strftime('%d %b %Y')}")

    if post.exam_date:
        lines.append(f"📝 *Exam Date:* {post.exam_date.strftime('%d %b %Y')}")

    if post.salary_range and post.salary_range.get("text"):
        lines.append(f"💰 *Salary:* {post.salary_range['text']}")

    if post.eligibility:
        for item in post.eligibility[:2]:
            lines.append(f"🎓 *{item['label']}:* {item['value']}")

    lines.append("")
    lines.append(f"🌐 [Full Details & Apply]({_post_url(post)})")

    if post.source_url:
        lines.append(f"📎 [Official Website]({post.source_url})")

    lines.append("")
    hashtags = _build_hashtags(post)
    lines.append(hashtags)

    return "\n".join(lines)


def _build_hashtags(post: Post) -> str:
    tags = ["#SarkariSchool", "#GovtJobs", "#SarkariNaukri"]

    if post.department:
        dept_tag = "#" + post.department.name.replace(" ", "").replace("-", "")
        tags.append(dept_tag)

    if post.category:
        cat_tag = "#" + post.category.name.replace(" ", "").replace("-", "")
        tags.append(cat_tag)

    type_tags = {
        PostType.job: "#Jobs2025",
        PostType.result: "#Result",
        PostType.admit_card: "#AdmitCard",
        PostType.answer_key: "#AnswerKey",
        PostType.syllabus: "#Syllabus",
        PostType.admission: "#Admission",
    }
    if post.post_type in type_tags:
        tags.append(type_tags[post.post_type])

    return " ".join(tags[:8])  # Telegram works best with ≤8 tags


async def send_post_to_telegram(post: Post) -> int:
    """Send a post to the Telegram channel. Returns message_id."""
    if not settings.TELEGRAM_BOT_TOKEN or not settings.TELEGRAM_CHANNEL_ID:
        raise ValueError("Telegram not configured")

    bot = Bot(token=settings.TELEGRAM_BOT_TOKEN)
    caption = _format_caption(post)

    # Send PDF if available
    if post.pdf_urls and len(post.pdf_urls) > 0:
        try:
            msg = await bot.send_document(
                chat_id=settings.TELEGRAM_CHANNEL_ID,
                document=post.pdf_urls[0],
                caption=caption,
                parse_mode=ParseMode.MARKDOWN,
            )
            return msg.message_id
        except Exception:
            pass  # Fall through to text message

    # Send text message
    msg = await bot.send_message(
        chat_id=settings.TELEGRAM_CHANNEL_ID,
        text=caption,
        parse_mode=ParseMode.MARKDOWN,
        disable_web_page_preview=False,
    )

    # Pin if important
    if post.is_pinned:
        try:
            await bot.pin_chat_message(
                chat_id=settings.TELEGRAM_CHANNEL_ID,
                message_id=msg.message_id,
                disable_notification=False,
            )
        except Exception:
            pass

    return msg.message_id


async def send_raw_message(text: str, pin: bool = False) -> int:
    """Send a custom message to the Telegram channel."""
    bot = Bot(token=settings.TELEGRAM_BOT_TOKEN)
    msg = await bot.send_message(
        chat_id=settings.TELEGRAM_CHANNEL_ID,
        text=text,
        parse_mode=ParseMode.MARKDOWN,
    )
    if pin:
        await bot.pin_chat_message(
            chat_id=settings.TELEGRAM_CHANNEL_ID,
            message_id=msg.message_id,
        )
    return msg.message_id
