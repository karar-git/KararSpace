import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Helper to create slug from title
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
}

// ============ PROJECTS ============

// Public: Get all published projects
router.get('/projects', async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: { published: true },
      orderBy: { publishedAt: 'desc' },
    });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Public: Get single project by slug
router.get('/projects/:slug', async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { slug: req.params.slug },
    });
    if (!project || !project.published) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// Admin: Get all projects (including drafts)
router.get('/admin/projects', authMiddleware, async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Admin: Create project
router.post('/admin/projects', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { title, ...data } = req.body;
    const slug = data.slug || slugify(title);
    
    const project = await prisma.project.create({
      data: { title, slug, ...data },
    });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Admin: Update project
router.put('/admin/projects/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// Admin: Delete project
router.delete('/admin/projects/:id', authMiddleware, async (req, res) => {
  try {
    await prisma.project.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// ============ ARTICLES ============

router.get('/articles', async (req, res) => {
  try {
    const articles = await prisma.article.findMany({
      where: { published: true },
      orderBy: { publishedAt: 'desc' },
    });
    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

router.get('/articles/:slug', async (req, res) => {
  try {
    const article = await prisma.article.findUnique({
      where: { slug: req.params.slug },
    });
    if (!article || !article.published) {
      return res.status(404).json({ error: 'Article not found' });
    }
    res.json(article);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch article' });
  }
});

router.get('/admin/articles', authMiddleware, async (req, res) => {
  try {
    const articles = await prisma.article.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

router.post('/admin/articles', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { title, ...data } = req.body;
    const slug = data.slug || slugify(title);
    
    const article = await prisma.article.create({
      data: { title, slug, ...data },
    });
    res.json(article);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create article' });
  }
});

router.put('/admin/articles/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const article = await prisma.article.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(article);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update article' });
  }
});

router.delete('/admin/articles/:id', authMiddleware, async (req, res) => {
  try {
    await prisma.article.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete article' });
  }
});

// ============ CERTIFICATES ============

router.get('/certificates', async (req, res) => {
  try {
    const certificates = await prisma.certificate.findMany({
      orderBy: { issueDate: 'desc' },
    });
    res.json(certificates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch certificates' });
  }
});

router.get('/admin/certificates', authMiddleware, async (req, res) => {
  try {
    const certificates = await prisma.certificate.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(certificates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch certificates' });
  }
});

router.post('/admin/certificates', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const certificate = await prisma.certificate.create({ data: req.body });
    res.json(certificate);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create certificate' });
  }
});

router.put('/admin/certificates/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const certificate = await prisma.certificate.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(certificate);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update certificate' });
  }
});

router.delete('/admin/certificates/:id', authMiddleware, async (req, res) => {
  try {
    await prisma.certificate.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete certificate' });
  }
});

// ============ RESEARCH ============

router.get('/research', async (req, res) => {
  try {
    const research = await prisma.research.findMany({
      orderBy: { publishedAt: 'desc' },
    });
    res.json(research);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch research' });
  }
});

router.get('/research/:slug', async (req, res) => {
  try {
    const research = await prisma.research.findUnique({
      where: { slug: req.params.slug },
    });
    if (!research) {
      return res.status(404).json({ error: 'Research not found' });
    }
    res.json(research);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch research' });
  }
});

router.get('/admin/research', authMiddleware, async (req, res) => {
  try {
    const research = await prisma.research.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(research);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch research' });
  }
});

router.post('/admin/research', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { title, ...data } = req.body;
    const slug = data.slug || slugify(title);
    
    const research = await prisma.research.create({
      data: { title, slug, ...data },
    });
    res.json(research);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create research' });
  }
});

router.put('/admin/research/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const research = await prisma.research.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(research);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update research' });
  }
});

router.delete('/admin/research/:id', authMiddleware, async (req, res) => {
  try {
    await prisma.research.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete research' });
  }
});

// ============ IDEAS ============

router.get('/ideas', async (req, res) => {
  try {
    const ideas = await prisma.idea.findMany({
      where: { published: true },
      orderBy: { publishedAt: 'desc' },
    });
    res.json(ideas);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch ideas' });
  }
});

router.get('/ideas/:slug', async (req, res) => {
  try {
    const idea = await prisma.idea.findUnique({
      where: { slug: req.params.slug },
    });
    if (!idea || !idea.published) {
      return res.status(404).json({ error: 'Idea not found' });
    }
    res.json(idea);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch idea' });
  }
});

router.get('/admin/ideas', authMiddleware, async (req, res) => {
  try {
    const ideas = await prisma.idea.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(ideas);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch ideas' });
  }
});

router.post('/admin/ideas', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { title, ...data } = req.body;
    const slug = data.slug || slugify(title);
    
    const idea = await prisma.idea.create({
      data: { title, slug, ...data },
    });
    res.json(idea);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create idea' });
  }
});

router.put('/admin/ideas/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const idea = await prisma.idea.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(idea);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update idea' });
  }
});

router.delete('/admin/ideas/:id', authMiddleware, async (req, res) => {
  try {
    await prisma.idea.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete idea' });
  }
});

// ============ LIFE CONTENT ============

router.get('/life', async (req, res) => {
  try {
    const life = await prisma.lifeContent.findMany({
      where: { published: true },
      orderBy: { publishedAt: 'desc' },
    });
    res.json(life);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch life content' });
  }
});

router.get('/life/:slug', async (req, res) => {
  try {
    const life = await prisma.lifeContent.findUnique({
      where: { slug: req.params.slug },
    });
    if (!life || !life.published) {
      return res.status(404).json({ error: 'Life content not found' });
    }
    res.json(life);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch life content' });
  }
});

router.get('/admin/life', authMiddleware, async (req, res) => {
  try {
    const life = await prisma.lifeContent.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(life);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch life content' });
  }
});

router.post('/admin/life', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { title, ...data } = req.body;
    const slug = data.slug || slugify(title);
    
    const life = await prisma.lifeContent.create({
      data: { title, slug, ...data },
    });
    res.json(life);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create life content' });
  }
});

router.put('/admin/life/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const life = await prisma.lifeContent.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(life);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update life content' });
  }
});

router.delete('/admin/life/:id', authMiddleware, async (req, res) => {
  try {
    await prisma.lifeContent.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete life content' });
  }
});

// ============ NOW FOCUS ============

router.get('/now', async (req, res) => {
  try {
    const now = await prisma.nowFocus.findMany({
      where: { status: 'active' },
      orderBy: { startDate: 'desc' },
    });
    res.json(now);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch now focus' });
  }
});

router.get('/admin/now', authMiddleware, async (req, res) => {
  try {
    const now = await prisma.nowFocus.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(now);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch now focus' });
  }
});

router.post('/admin/now', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const now = await prisma.nowFocus.create({ data: req.body });
    res.json(now);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create now focus' });
  }
});

router.put('/admin/now/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const now = await prisma.nowFocus.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(now);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update now focus' });
  }
});

router.delete('/admin/now/:id', authMiddleware, async (req, res) => {
  try {
    await prisma.nowFocus.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete now focus' });
  }
});

// ============ SITE SETTINGS ============

router.get('/settings', async (req, res) => {
  try {
    let settings = await prisma.siteSettings.findUnique({ where: { id: 'main' } });
    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: { id: 'main' },
      });
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

router.put('/admin/settings', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const settings = await prisma.siteSettings.upsert({
      where: { id: 'main' },
      update: req.body,
      create: { id: 'main', ...req.body },
    });
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

export default router;
