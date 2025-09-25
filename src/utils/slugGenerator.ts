import { Portfolio } from '../models/Portfolio';

export class SlugGenerator {
  static generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  static async generateUniqueSlug(name: string, excludeId?: string): Promise<string> {
    const baseSlug = this.generateSlug(name);
    
    if (!baseSlug) {
      throw new Error('Cannot generate slug from empty name');
    }

    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existingPortfolio = await Portfolio.findOne({ 
        slug,
        ...(excludeId && { _id: { $ne: excludeId } })
      });

      if (!existingPortfolio) {
        return slug;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  static async isSlugAvailable(slug: string, excludeId?: string): Promise<boolean> {
    const existingPortfolio = await Portfolio.findOne({ 
      slug,
      ...(excludeId && { _id: { $ne: excludeId } })
    });

    return !existingPortfolio;
  }
}
