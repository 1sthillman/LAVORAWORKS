import type { Project } from '@/types';
import { generateId } from '@/lib/utils';

export const demoProjects: Project[] = [
  {
    id: generateId(),
    name: 'Logo Tasarımı',
    client: 'ABC Teknoloji',
    status: 'active',
    startDate: new Date('2024-10-01').toISOString(),
    dueDate: new Date('2024-11-15').toISOString(),
    totalAmount: 15000,
    paidAmount: 7500,
    progress: 60,
    description: 'Modern ve minimalist logo tasarımı',
    createdAt: new Date('2024-10-01').toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'Web Sitesi Tasarımı',
    client: 'XYZ Medya',
    status: 'active',
    startDate: new Date('2024-09-15').toISOString(),
    dueDate: new Date('2024-12-01').toISOString(),
    totalAmount: 45000,
    paidAmount: 20000,
    progress: 45,
    description: 'Kurumsal web sitesi UI/UX tasarımı ve geliştirme',
    createdAt: new Date('2024-09-15').toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'Marka Kimliği',
    client: 'DEF Gıda',
    status: 'completed',
    startDate: new Date('2024-08-01').toISOString(),
    dueDate: new Date('2024-09-30').toISOString(),
    totalAmount: 30000,
    paidAmount: 30000,
    progress: 100,
    description: 'Tam kapsamlı marka kimliği çalışması',
    createdAt: new Date('2024-08-01').toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'Sosyal Medya Görselleri',
    client: 'GHI Moda',
    status: 'active',
    startDate: new Date('2024-10-10').toISOString(),
    totalAmount: 8000,
    paidAmount: 2000,
    progress: 30,
    description: 'Aylık sosyal medya içerik tasarımları',
    createdAt: new Date('2024-10-10').toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'Katalog Tasarımı',
    client: 'JKL İnşaat',
    status: 'paused',
    startDate: new Date('2024-09-01').toISOString(),
    totalAmount: 12000,
    paidAmount: 4000,
    progress: 25,
    description: '24 sayfa ürün kataloğu',
    createdAt: new Date('2024-09-01').toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const seedDemoData = async (db: any) => {
  try {
    // Check if data already exists
    const existingProjects = await db.getProjects();
    if (existingProjects.length > 0) {
      console.log('Demo data already exists');
      return;
    }

    // Seed projects
    for (const project of demoProjects) {
      await db.saveProject(project);
    }

    console.log('Demo data seeded successfully');
  } catch (error) {
    console.error('Error seeding demo data:', error);
  }
};
