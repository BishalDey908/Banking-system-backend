import React, { useState } from 'react';
import { Plane, Car, Plus, Sparkles, CheckCircle2 } from 'lucide-react';
import { Card } from '../common/Card';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { useToast } from '../../hooks/useToast';

/**
 * Modern Fincheck My Goals Widget
 * 
 * Renders savings goals with segmented progress bars
 * matching the Fincheck reference layout.
 */
export function GoalsWidget({ className = '' }) {
  const { showSuccess } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');

  const [goals, setGoals] = useState([
    {
      id: 'g-1',
      title: 'Travel',
      current: 1000,
      target: 2000,
      percent: 50,
      icon: <Plane className="w-4 h-4 text-slate-600 dark:text-slate-300" />,
    },
    {
      id: 'g-2',
      title: 'Car',
      current: 8500,
      target: 42500,
      percent: 20,
      icon: <Car className="w-4 h-4 text-slate-600 dark:text-slate-300" />,
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
      icon: <Sparkles className="w-4 h-4 text-blue-500" />,
    };

    setGoals((prev) => [...prev, newGoal]);
    setNewGoalTitle('');
    setNewGoalTarget('');
    setModalOpen(false);
    showSuccess(`Savings goal "${newGoal.title}" created!`);
  };

  /**
   * Renders 10 modern segmented pill dashes
   * e.g. 50% => 5 filled dashes, 5 unfilled dashes
   */
  const renderSegmentedBar = (percent) => {
    const totalSegments = 10;
    const filledCount = Math.min(totalSegments, Math.max(0, Math.round((percent / 100) * totalSegments)));

    return (
      <div className="flex items-center gap-1.5 w-full mt-2 select-none">
        {Array.from({ length: totalSegments }).map((_, idx) => (
          <div
            key={idx}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              idx < filledCount
                ? 'bg-blue-600 dark:bg-blue-500'
                : 'bg-slate-200 dark:bg-slate-700'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      <Card padding="md" className={`rounded-2xl bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-100">
            My Goals
          </h3>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1 bg-[#3b82f6] hover:bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors shadow-xs select-none"
          >
            <span>Add Goals</span>
          </button>
        </div>

        {/* Goals List */}
        <div className="space-y-4">
          {goals.map((goal) => (
            <div
              key={goal.id}
              className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100/80 dark:border-slate-800/60"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 shadow-2xs border border-slate-100 dark:border-slate-700 flex items-center justify-center shrink-0">
                    {goal.icon}
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                      {goal.title}
                    </span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                      ${goal.current.toLocaleString('en-US', { minimumFractionDigits: 2 })} / ${goal.target.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                  {goal.percent}%
                </span>
              </div>

              {/* Segmented Progress Bar */}
              {renderSegmentedBar(goal.percent)}
            </div>
          ))}
        </div>
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
          <Input
            label="Goal Name"
            placeholder="e.g. New Laptop, Emergency Fund"
            value={newGoalTitle}
            onChange={(e) => setNewGoalTitle(e.target.value)}
            required
          />

          <Input
            label="Target Amount ($)"
            type="number"
            min="1"
            step="any"
            placeholder="5000"
            value={newGoalTarget}
            onChange={(e) => setNewGoalTarget(e.target.value)}
            required
          />

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
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Save Goal
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}

export default GoalsWidget;

