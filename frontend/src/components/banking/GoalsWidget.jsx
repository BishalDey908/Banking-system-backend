import React, { useState } from 'react';
import { Plane, Car, Plus, Sparkles } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Modal } from '../common/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '../../hooks/useToast';

/**
 * Authentic shadcn/ui Goals Widget
 */
export function GoalsWidget({ className = '' }) {
  const { showSuccess } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');

  const [goals, setGoals] = useState([
    {
      id: 'g-1',
      title: 'Travel Fund',
      current: 1000,
      target: 2000,
      percent: 50,
      icon: <Plane className="w-4 h-4 text-foreground" />,
    },
    {
      id: 'g-2',
      title: 'Car Down Payment',
      current: 8500,
      target: 42500,
      percent: 20,
      icon: <Car className="w-4 h-4 text-foreground" />,
    },
  ]);

  const handleAddGoal = (e) => {
    e.preventDefault();
    if (!newGoalTitle.trim() || !newGoalTarget) return;

    const targetVal = Math.max(1, Number(newGoalTarget) || 1000);
    const newGoal = {
      id: `g-${Date.now()}`,
      title: newGoalTitle.trim(),
      current: 0,
      target: targetVal,
      percent: 0,
      icon: <Sparkles className="w-4 h-4 text-primary" />,
    };

    setGoals((prev) => [...prev, newGoal]);
    setNewGoalTitle('');
    setNewGoalTarget('');
    setModalOpen(false);
    showSuccess(`Savings goal "${newGoal.title}" created!`);
  };

  return (
    <>
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-base font-semibold">Savings Goals</CardTitle>
            <CardDescription className="text-xs">
              Track your progress toward target milestones.
            </CardDescription>
          </div>

          <Button
            size="sm"
            onClick={() => setModalOpen(true)}
            className="gap-1.5 h-8 text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Goal</span>
          </Button>
        </CardHeader>

        <CardContent className="pt-0 space-y-4">
          {goals.map((goal) => (
            <div
              key={goal.id}
              className="p-3.5 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center shrink-0">
                    {goal.icon}
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-foreground block">
                      {goal.title}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      ${goal.current.toLocaleString('en-US', { minimumFractionDigits: 2 })} / ${goal.target.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <span className="text-xs font-bold text-foreground tabular-nums">
                  {goal.percent}%
                </span>
              </div>

              {/* shadcn Progress Bar */}
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary mt-3">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${Math.min(100, goal.percent)}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Add Goal Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create Savings Goal"
        description="Set a financial milestone to track your progress"
        size="sm"
      >
        <form onSubmit={handleAddGoal} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="goal-name">Goal Name</Label>
            <Input
              id="goal-name"
              placeholder="e.g. New Laptop, Emergency Fund"
              value={newGoalTitle}
              onChange={(e) => setNewGoalTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal-target">Target Amount ($)</Label>
            <Input
              id="goal-target"
              type="number"
              min="1"
              step="any"
              placeholder="5000"
              value={newGoalTarget}
              onChange={(e) => setNewGoalTarget(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Save Goal</span>
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}

export default GoalsWidget;
