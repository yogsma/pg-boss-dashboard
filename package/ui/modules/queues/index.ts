import { ListTodo, List, FileText } from 'lucide-react';
import { UIModuleManifest } from '../registry';

export const queuesUIModule: UIModuleManifest = {
  id: 'queues',
  name: 'Job Queues',
  icon: ListTodo,
  basePath: '/queues',
  navItems: [
    { label: 'All Queues', href: '/queues', icon: List },
    { label: 'Job Details', href: '/jobs', icon: FileText },
  ],
};
