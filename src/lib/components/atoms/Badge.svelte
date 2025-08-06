<script lang="ts">
  export let variant: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'secondary' = 'default';
  export let size: 'sm' | 'md' = 'md';
  
  const variantClasses = {
    default: 'bg-slate-100 text-slate-800',
    secondary: 'bg-slate-100 text-slate-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-amber-100 text-amber-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800'
  };
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm'
  };
  
  $: badgeClass = `
    inline-flex items-center font-medium rounded-full
    ${variantClasses[variant]}
    ${sizeClasses[size]}
  `;
</script>

<span class={badgeClass} {...$$restProps}>
  <slot />
</span>